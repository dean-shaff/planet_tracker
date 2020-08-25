## Change Log

### 2.0.1

- got rid of ionicons in favor of more familiar octicons.
- fixed some socket issues that were apparent in heroku release.

### 2.0.2

- moved from gunicorn version 19.9.0 to 19.7.1. See [this](https://github.com/benoitc/gunicorn/issues/1797)
issue. With 19.9.0, we can't load JS static files from the server. This is
particularly bad on mobile.

### 2.0.3

- Added 'beforeunload' event handler to close socket before page closes.

### 3.0.0

- Moved back to using HTTPS requests instead of web sockets. Web sockets
simply didn't work when deployed on heroku. I'm not sure what the issue was,
but I realized that this app didn't have the data throughput to justify the
use of web sockets.

### 3.0.2

- Fixed bug on mobile where the keyboard would appear and immediately disappear when using one of the input fields in the `GeoLocationTimeDisplay` component.
- On mobile, the Longitude, Latitude and Elevation boxes now use a keypad instead of a keyboard.

### 3.0.3

- Fixed bug where app couldn't correctly handle `null` elevation value.

### 3.1.0

- Using poetry instead of pipenv.
- Add next rising time to data sent to client

### 3.1.1

- Change locations of public directories
