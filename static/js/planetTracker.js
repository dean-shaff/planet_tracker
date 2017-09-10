function PlanetTracker(socket, pos, dataInit, bindElement, rad, width, height, logLevel) {

    this.logger = new Logger("PlanetTracker", logLevel);
    this.socket = socket;
    this.pos = pos ;
    this.planetData = dataInit;
    this.bindElement = bindElement ;
    this.rad = rad ;
    this.width = width ;
    this.height = height ;
    this.black = "rgba(0,0,0,{})" ;
    this.hoverTransition = 300 ;
    this.planets = [];
    this.alphaMapper = util.mapRange(7, -27, 0.1, 1);

    this.toDegree = function(radian){
        return (180.*radian)/(Math.PI)
    }

    this.createPlanets = function(){
        var self = this;
        this.logger.debug("PlanetTracker.createPlanetCircles: Called.")
        this.logger.debug("PlanetTracker.createPlanetCircles: First element of this.planetData: {}, ({}, {})".format(
            this.planetData[0].name,
            this.planetData[0].sameDayPos[0].cx,
            this.planetData[0].sameDayPos[0].cy
        ));
        for (var i=0; i<this.planetData.length; i++){
            planetGroup = this.bindElement.append('g');
            planet = new D3Planet(self, planetGroup, this.planetData[i]);
            planet.setup();
            this.planets[i] = planet ;
        }
    }


    this.setup = function(){
        var self = this;
        this.updatePlanetData(self)(this.planetData);
        this.createPlanets();
    }

    this.setupSocket = function(){
        var self = this ;
        this.socket.on("planetTracker.get_planets_cb", function(data){
            self.logger.debug("get_planets_cb: Called.")
            self.updatePlanetData(self)(data)
            self.updatePlanets(self)(data)
        })
    }

    // Callbacks
    this.updatePlanets = function(self){
        return function(){
            var planet ;
            self.logger.debug1("updatePlanetCircles: Called. this.planetData: {}".format(self.planetData[0].sameDayPos[0].cx))
            for (var i=0; i<self.planetData.length; i++){
                planet = self.planets[i]
                planet.update(planet)(self.planetData[i]);
            }
        };
    };


    this.update = function(self){
        return function(){
            self.logger.debug1("PlanetTracker.update: Called.")
            self.logger.debug1("PlanetTracker.update: Position: {}".format(self.pos));
            // util.requestData("/get_planets", self.pos,
            //             [self.updatePlanetData(self),
            //             self.updatePlanets(self)]);
            self.socket.emit("get_planets", {kwargs: {pos: pos, cb_info:{
                cb: "planetTracker.get_planets_cb"
            }}})
        };
    };

    this.updatePlanetData = function(self){
        return function(data){
    //        console.log("updatePlanetData: Called") ;
            var planetColor ;
            var strokeWidth ;
            self.planetData = data ;
            self.planetData.forEach(function(d, i){
                d.r = d.size * parseInt((rad)/ 50., 10);
                d.sameDayPos.forEach(function(di){
                    di.az = di[0];
                    di.alt = di[1];
                    di.radialPos = (rad*((Math.PI/2.0)-Math.abs(di.alt)))/(Math.PI/2.0);
                    di.az_adj = di.az - Math.PI/2.0 ;
                    di.cx = "{:.4f}".format(di.radialPos*Math.cos(di.az_adj))
                    di.cy = "{:.4f}".format(di.radialPos*Math.sin(di.az_adj))
                })
                d.sameTimePos.forEach(function(di){
                    di.az = di[0];
                    di.alt = di[1];
                    di.radialPos = (rad*((Math.PI/2.0)-Math.abs(di.alt)))/(Math.PI/2.0);
                    di.az_adj = di.az - Math.PI/2.0 ;
                    di.cx = "{:.4f}".format(di.radialPos*Math.cos(di.az_adj))
                    di.cy = "{:.4f}".format(di.radialPos*Math.sin(di.az_adj))
                    di.r = d.r
                })
                self.logger.debug1("{}: {}".format(d.name, self.alphaMapper(d.magnitude)));
                if (d.sameDayPos[0].alt >= 0){
                    planetColor = d.color.format(self.alphaMapper(d.magnitude));
                    strokeWidth = 0 ;
                }else{
                    planetColor = d.color.format(0.0);
                    strokeWidth = 1 ;
                }
                d.planetColor = planetColor;
                d.strokeWidth = strokeWidth;
            });
        };
    }
}
