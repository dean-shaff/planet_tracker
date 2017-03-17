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
    'moon': {'ephem_obj': ephem.Moon(), 'color': "rgba(0,0,0,{})", 'size': 1.0}
}



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

    continuous = current_position['continuous']
    if continuous:
        global startup_time
        startup_time += datetime.timedelta(minutes=15)
        observer.date = startup_time
    else:
        observer.date = datetime.datetime.utcnow()

    planet_list = []
    for pl_key in planets_info:
        planet = planets_info[pl_key]
        ephem_obj = planet['ephem_obj']
        ephem_obj.compute(observer)
        app.logger.debug("{}: AZ: {} ALT: {}\nRA: {} DEC: {}".format(pl_key, ephem_obj.az, ephem_obj.alt,
                                                                        ephem_obj.ra, ephem_obj.dec))
        planet_list.append({'color': planet['color'],
                            'name': pl_key.capitalize(),
                            'size':planet['size'],
                            'az': float(ephem_obj.az),
                            'alt': float(ephem_obj.alt)})

    return jsonify(result=json.dumps(planet_list))

@app.route("/")
def main():
    app.logger.debug("Rendering index.html")
    return render_template("index.html")

if __name__ == '__main__':
    app.logger.setLevel(logging.INFO)
    formatter = logging.Formatter("%(levelname)s-%(name)s-%(message)s")
    sh = logging.StreamHandler(sys.stdout)
    sh.setFormatter(formatter)
    app.logger.addHandler(sh)

    app.run(debug=True)