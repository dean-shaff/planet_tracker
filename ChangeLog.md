## Change Log

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
