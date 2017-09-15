import time
import datetime
import json
import logging
import sys
import math

import ephem
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, send, emit
import gevent

def sign(n):
    """
    Get the sign of the argument
    Args:
        n (float/int):
    """
    if n > 0:
        return 1
    elif n < 0:
        return -1
    elif n == 0:
        return 0


class App(object):

    planets_info = {
        'jupiter': {'ephem_obj':ephem.Jupiter(), 'color': "rgba(150,81,46,{})", 'size': 1.0},
        'venus': {'ephem_obj':ephem.Venus(),'color': "rgba(171,99,19,{})", 'size': 1.0},
        'saturn': {'ephem_obj':ephem.Saturn(),'color': "rgba(215,179,119,{})", 'size': 1.0},
        'mars': {'ephem_obj':ephem.Mars(),'color': "rgba(114,47,18,{})", 'size': 1.0},
        'mercury': {'ephem_obj':ephem.Mercury(),'color': "rgba(215,179,119,{})", 'size': 1.0},
        'uranus': {'ephem_obj':ephem.Uranus(),'color': "rgba(195,233,236,{})", 'size': 1.0},
        'neptune': {'ephem_obj':ephem.Neptune(),'color': "rgba(71,114,255,{})", 'size': 1.0},
        'sun': {'ephem_obj': ephem.Sun(), 'color': "rgba(255,204,0,{})", 'size': 2.0},
        'moon': {'ephem_obj': ephem.Moon(), 'color': "rgba(128,128,128,{})", 'size': 1.0}
    }

    socket_handlers = ["get_planets", "disconnect", "connect"]
    routes = {"main":"/"}

    def __init__(self):

        observer = ephem.Observer()
        observer.pressure = 0
        observer.epoch = ephem.J2000

        app = Flask(__name__)
        app.config["SECRET_KEY"] = "planet-app"
        socketio = SocketIO(app)

        self.observer = observer
        self.app = app
        self.socketio = socketio
        self.n_connections = 0
        self.start_time = datetime.datetime.utcnow()

        self.generate_routes()
        self.generate_handlers()

    def get_planets(self, data):
        """
        Args:
            current_position (dict): A dictionary containing the current position of the observer.
        Returns:
            dict: Containing az/alt information about the 7 non earth planets.
                The az/alt information is in radians.
        """
        self.observer.lon = str(data['kwargs']['pos']['lon'])
        self.observer.lat = str(data['kwargs']['pos']['lat'])
        self.observer.elevation = data['kwargs']['pos']['elevation']
        self.app.logger.debug("Lat: {}, Lon: {}".format(self.observer.lat, self.observer.lon))
        continuous = False
        cb_info = data['kwargs']['cb_info']
        cb = cb_info['cb']
        self.app.logger.debug("cb name: {}".format(cb))
        if continuous:
            self.start_time += datetime.timedelta(minutes=15)
            self.observer.date = self.start_time
            utcnow = self.start_time
        else:
            utcnow = datetime.datetime.utcnow()
            self.observer.date = utcnow

        t0 = time.time()
        planet_list = []

        for pl_key in self.planets_info:
            ti = time.time()
            planet = self.planets_info[pl_key]
            ephem_obj = planet['ephem_obj']
            same_day_position = [] # the position of the planet on the same day, throughout the day. (For drawing arcs)
            same_time_position = [] # the position of the planet at the same time, but at different days
            time_var = utcnow
            for i in xrange(28): # a month
                time_var += datetime.timedelta(days=1)
                self.observer.date = time_var
                ephem_obj.compute(self.observer)
                same_time_position.append([ephem_obj.az, ephem_obj.alt])

            time_var = utcnow
            self.observer.date = time_var
            ephem_obj.compute(self.observer)
            same_day_position.append([ephem_obj.az, ephem_obj.alt])
            setting_time = None
            while (True):
                time_var += datetime.timedelta(minutes=15)
                self.observer.date = time_var
                ephem_obj.compute(self.observer)
                if sign(ephem_obj.alt) != sign(same_day_position[-1][1]):
                    setting_time = time_var
                    break
                else:
                    same_day_position.append([ephem_obj.az, ephem_obj.alt])
                # self.app.logger.debug("Current alt: {}".format(same_day_position[-1][1]))

            # self.app.logger.debug("Took {:.2f} seconds to compute planet {}".format(time.time() - ti, pl_key))
            ephem_obj.compute(self.observer)
            # print(ephem_obj.mag)
            # self.app.logger.debug("{}: AZ: {} ALT: {}\nRA: {} DEC: {}".format(pl_key, ephem_obj.az, ephem_obj.alt,
            #                                                                 ephem_obj.ra, ephem_obj.dec))
            planet_list.append({'setting_time':setting_time.strftime("%H:%M:%S"),
                                'color': planet['color'],
                                'name': pl_key.capitalize(),
                                'size': math.log(ephem_obj.size),
                                'sameDayPos': same_day_position,
                                'sameTimePos': same_time_position,
                                'magnitude':ephem_obj.mag})

        self.app.logger.debug("Took {:.2f} seconds to compute planet positions".format(time.time() - t0))
        with self.app.test_request_context("/"):
            self.app.logger.debug("Requested context");
            self.socketio.emit(cb, planet_list)
            self.app.logger.debug("Fired callback");

    def connect(self):
        self.n_connections += 1
        self.app.logger.info("connect: Current number of connections: {}".format(self.n_connections))

    def disconnect(self):
        self.n_connections -= 1
        self.app.logger.info("disconnect: Current number of connections: {}".foramt(self.n_connections))

    def main(self):
        self.app.logger.debug("Rendering index.html")
        return render_template("index.html")

    def generate_handlers(self):
        for handler in self.socket_handlers:
            self.socketio.on(handler)(getattr(self, handler))

    def generate_routes(self):
        for route in self.routes:
            self.app.route(self.routes[route])(getattr(self, route))

    def run(self, *args, **kwargs):
        self.socketio.run(self.app, *args, **kwargs)

app = App().app

if __name__ == '__main__':
    app = App()
    app.app.logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter("%(levelname)s-%(name)s-%(message)s")
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(formatter)
    app.app.logger.addHandler(sh)
    app.run(debug=True, host='10.224.44.158')
