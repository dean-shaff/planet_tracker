## Change Log

### Version 2.0.1

- got rid of ionicons in favor of more familiar octicons.
- fixed some socket issues that were apparent in heroku release.

### Version 2.0.2

- moved from gunicorn version 19.9.0 to 19.7.1. See [this](https://github.com/benoitc/gunicorn/issues/1797)
issue. With 19.9.0, we can't load JS static files from the server. This is
particularly bad on mobile.
