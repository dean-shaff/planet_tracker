import time
import datetime
import json
import logging
import sys
import math

import ephem
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, send, emit
import eventlet

eventlet.monkey_patch()

__version__ = "1.0.0"


def sign(n):
    """
    Get the sign of the argument
    Args:
        n (float/int):
    Returns:
        int: -1 for negative number, 1 for positive, 0 for 0.
    """
    if n > 0:
        return 1
    elif n < 0:
        return -1
    elif n == 0:
        return 0


class App(object):

    socket_handlers = ["get_astron_object_data", "disconnect", "connect"]
    routes = {"main": "/"}

    def __init__(self):

        app = Flask(
            __name__,
            static_folder="client/dist",
            template_folder="client"
        )
        app.config["SECRET_KEY"] = "planet-app"
        socketio = SocketIO(app)

        self.app = app
        self.socketio = socketio
        self.n_connections = 0
        self.start_time = datetime.datetime.utcnow()

        self.generate_routes()
        self.generate_handlers()

    def init_observer(self):

        observer = ephem.Observer()
        observer.pressure = 0
        observer.epoch = ephem.J2000
        return observer

    def get_astron_object_data(self, data):
        """
        Get data about an astronomical object
        Args:
            data (dictionary): A dictionary with the following keys:
                - name: name of object
                - when: string indicating when we want data
                - geo_location: location for which we want ephemerides
                - cb_name: name of client side callback event to fire
        Returns:
            None
        """
        observer = self.init_observer()
        observer_location = data["geo_location"]
        observer.lon = str(observer_location["lon"])
        observer.lat = str(observer_location["lat"])
        observer.elevation = float(observer_location["elevation"])
        when_str = str(data["when"])
        when = datetime.datetime.strptime(
            when_str,
            "%Y-%m-%dT%H:%M:%SZ"
        )
        observer.date = when
        astron_obj_name = str(data["name"])

        astron_obj = getattr(ephem, astron_obj_name)()
        self.app.logger.debug("get_astron_object_data: {}".format(astron_obj))
        astron_obj.compute(observer)

        return_data = {
            "name": astron_obj_name,
            "magnitude": astron_obj.mag,
            "size": astron_obj.size,
            "az": astron_obj.az,
            "el": astron_obj.alt,
            "ra": astron_obj.ra,
            "dec": astron_obj.dec,
            "setting_time": str(observer.next_setting(astron_obj)),
            "when": when_str
        }
        cb_name = data["cb_name"]
        with self.app.app_context():
            self.socketio.emit(cb_name, return_data)

    def connect(self):
        self.n_connections += 1
        self.app.logger.info(
            "connect: Current number of connections: {}".format(
                self.n_connections))

    def disconnect(self):
        self.n_connections -= 1
        self.app.logger.info(
            "disconnect: Current number of connections: {}".format(
                self.n_connections))

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
    app.run(debug=True, host='localhost')
