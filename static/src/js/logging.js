class Logging{
    constructor(){
        this.loggers = {};
        this.levels = {
            DEBUG1:0,
            DEBUG:10,
            DEBUG:20,
            INFO:30,
            ERROR:40,
            CRITICAL:50
        }
        this.level = this.levels.INFO;
    }

    addLogger(logger){
        this.loggers[logger.name] = logger ;
    }

    setLevel(level){
        var self = this;
        this.level = level ;
        Object.keys(this.loggers).forEach(function(e){
            self.loggers[e].setLevel(level);
        })
    }
}

var logging = new Logging();

class Formatter {
    constructor(){

    }
}

class Logger{

    constructor(name, level){
        this.name = name ;
        if (! level){
            this.level = logging.level;
        } else {
            this.level = level ;
        }
        logging.addLogger(this);
    }

    logMessage(message, level){
        console.log(`${level}::${this.name}.${message}`);
    }

    setLevel(level){
        this.level = level;
    }

    info(message){
        if (this.level <= logging.levels.INFO){
            this.logMessage(message, "INFO");
        }
    }

    debug(message){
        if (this.level <= logging.levels.DEBUG){
            this.logMessage(message, "DEBUG");
        }
    }

    debug1(message){
        if (this.level <= logging.levels.DEBUG1){
            this.logMessage(message, "DEBUG1");
        }
    }

    error(message){
        if (this.level <= logging.levels.ERROR){
            this.logMessage(message, "ERROR");
        }
    }
}
