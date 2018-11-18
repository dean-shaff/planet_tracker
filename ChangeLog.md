## Change Log

### 2.0.0

- Moved back to using HTTPS requests instead of web sockets. Web sockets
simply didn't work when deployed on heroku. I'm not sure what the issue was,
but I realized that this app didn't have the data throughput to justify the
use of web sockets.
