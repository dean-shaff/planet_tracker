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

observer = ephem.Observer()
observer.pressure = 0
observer.epoch = ephem.J2000

app = Flask(__name__)
app.config["SECRET_KEY"] = "planet-app"
socketio = SocketIO(app)
module_logger = logging.getLogger(__name__)

startup_time = datetime.datetime.utcnow()

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

@socketio.on("get_planets")
def get_planets(data):
    """
    Args:
        current_position (dict): A dictionary containing the current position of the observer.
    Returns:
        dict: Containing az/alt information about the 7 non earth planets.
            The az/alt information is in radians.
    """
    observer.lon = str(data['kwargs']['pos']['lon'])
    observer.lat = str(data['kwargs']['pos']['lat'])
    observer.elevation = data['kwargs']['pos']['elevation']
    app.logger.debug("Lat: {}, Lon: {}".format(observer.lat, observer.lon))
    continuous = False
    cb_info = data['kwargs']['cb_info']
    cb = cb_info['cb']
    app.logger.debug("cb name: {}".format(cb))
    if continuous:
        global startup_time
        startup_time += datetime.timedelta(minutes=15)
        utcnow = startup_time
        observer.date = utcnow
    else:
        utcnow = datetime.datetime.utcnow()
        observer.date = utcnow

    t0 = time.time()
    planet_list = []

    for pl_key in planets_info:
        ti = time.time()
        planet = planets_info[pl_key]
        ephem_obj = planet['ephem_obj']
        same_day_position = [] # the position of the planet on the same day, throughout the day. (For drawing arcs)
        same_time_position = [] # the position of the planet at the same time, but at different days
        time_var = utcnow
        for i in xrange(28): # a month
            time_var += datetime.timedelta(days=1)
            observer.date = time_var
            ephem_obj.compute(observer)
            same_time_position.append([ephem_obj.az, ephem_obj.alt])

        time_var = utcnow
        observer.date = time_var
        ephem_obj.compute(observer)
        same_day_position.append([ephem_obj.az, ephem_obj.alt])
        setting_time = None
        while (True):
            time_var += datetime.timedelta(minutes=15)
            observer.date = time_var
            ephem_obj.compute(observer)
            if sign(ephem_obj.alt) != sign(same_day_position[-1][1]):
                setting_time = time_var
                break
            else:
                same_day_position.append([ephem_obj.az, ephem_obj.alt])
            # app.logger.debug("Current alt: {}".format(same_day_position[-1][1]))

        # app.logger.debug("Took {:.2f} seconds to compute planet {}".format(time.time() - ti, pl_key))
        ephem_obj.compute(observer)
        # print(ephem_obj.mag)
        # app.logger.debug("{}: AZ: {} ALT: {}\nRA: {} DEC: {}".format(pl_key, ephem_obj.az, ephem_obj.alt,
        #                                                                 ephem_obj.ra, ephem_obj.dec))
        planet_list.append({'setting_time':setting_time.strftime("%H:%M:%S"),
                            'color': planet['color'],
                            'name': pl_key.capitalize(),
                            'size': math.log(ephem_obj.size),
                            'sameDayPos': same_day_position,
                            'sameTimePos': same_time_position,
                            'magnitude':ephem_obj.mag})

    app.logger.debug("Took {:.2f} seconds to compute planet positions".format(time.time() - t0))
    with app.test_request_context("/"):
        socketio.emit(cb, planet_list)
    # return planet_list

@app.route("/")
def main():
    app.logger.debug("Rendering index.html")
    return render_template("index.html")

if __name__ == '__main__':
    app.logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter("%(levelname)s-%(name)s-%(message)s")
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(formatter)
    app.logger.addHandler(sh)
    socketio.run(app, debug=True, host='10.224.44.158')
    # app.run(debug=True, host='127.0.0.1', port=5001, threaded=True)
    # app.run(debug=True, host='10.224.44.158', port=5001, threaded=True)

    # app.run(debug=True, host='0.0.0.0', port=5000)
