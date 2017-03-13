import time
import datetime
import json
import logging
import sys

import ephem
from flask import Flask, render_template, jsonify, request

observer = ephem.Observer()
observer.pressure = 0
observer.epoch = ephem.J2000

app = Flask(__name__)
module_logger = logging.getLogger(__name__)

@app.route("/get_planets", methods=['POST'])
def get_planets():
    """
    Args:
        current_position (dict): A dictionary containing the current position of the observer.
    Returns:
        dict: Containing az/alt information about the 7 non earth planets.
            The az/alt information is in radians.
    """
    current_position = request.get_json(force=True)
    observer.lon = str(current_position['lon'])
    observer.lat = str(current_position['lat'])
    observer.elevation = current_position['elevation']
    observer.date = datetime.datetime.utcnow() # + datetime.timedelta(hours=10)

    planets = {}
    planets['mercury'] = ephem.Mercury()
    planets['venus'] = ephem.Venus()
    planets['mars'] = ephem.Mars()
    planets['jupiter'] = ephem.Jupiter()
    planets['saturn'] = ephem.Saturn()
    planets['uranus'] = ephem.Uranus()
    planets['nepture'] = ephem.Neptune()
    planet_list = []
    for pl_key in planets:
        planet = planets[pl_key]
        planet.compute(observer)
        module_logger.debug("{}: AZ: {} ALT: {}\nRA: {} DEC: {}".format(pl_key, planet.az, planet.alt,
                                                                        planet.ra, planet.dec))
        planets[pl_key] = {'az': float(planet.az), 'alt': float(planet.alt)}
        planet_list.append({'name': pl_key.capitalize(), 'az': float(planet.az), 'alt': float(planet.alt)})

    return jsonify(result=json.dumps(planet_list))

@app.route("/")
def main():
    return render_template("index.html")

if __name__ == '__main__':
    module_logger.setLevel(logging.INFO)
    formatter = logging.Formatter("%(levelname)s-%(name)s-%(message)s")
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(formatter)
    module_logger.addHandler(sh)

    # pos_IC = {'long': 41.664515, 'lat': -91.500888, 'elevation': 203}
    # print(get_planets())
    app.run(debug=True)