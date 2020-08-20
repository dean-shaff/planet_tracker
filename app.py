import time
import datetime
import logging
import os

import ephem
from aiohttp import web

__version__ = "3.1.0"


public_dir = "./client"

if os.environ["MODE"] == "production" or os.environ["MODE"] == "prod":
    public_dir = "./public"


logger = logging.getLogger("planet-tracker")
routes = web.RouteTableDef()
app = web.Application()


def init_observer():

    observer = ephem.Observer()
    observer.pressure = 0
    observer.epoch = ephem.J2000
    return observer


@routes.get('/get_astron_object_data')
async def get_astron_object_data(request):
    """
    Get data about an astronomical object
    Args:
        request (aiohttp.Request): containing the following dict:
            - name: name of object
            - when: string indicating when we want data
            - geo_location: location for which we want ephemerides
            - cb_name: name of client side callback event to fire
    Returns:
        None
    """
    logger.debug(f"get_astron_object_data")
    data = request.query
    observer = init_observer()
    observer.lon = str(data["lon"])
    observer.lat = str(data["lat"])
    observer.elevation = float(data["elevation"])
    when_str = str(data["when"])
    when = datetime.datetime.strptime(
        when_str,
        "%Y-%m-%dT%H:%M:%SZ"
    )
    observer.date = when
    astron_obj_name = str(data["name"])

    astron_obj = getattr(ephem, astron_obj_name)()
    # self.app.logger.debug("get_astron_object_data: {}".format(astron_obj))
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
        "rising_time": str(observer.next_rising(astron_obj)),
        "when": when_str
    }
    logger.debug(f"sending {return_data}")
    return web.json_response(return_data)


@routes.get("/")
async def index(request):
    return web.FileResponse(os.path.join(public_dir, "index.html"))


app.add_routes(routes)
app.router.add_static("/", public_dir)


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    web.run_app(app, host="0.0.0.0", port=8000)
