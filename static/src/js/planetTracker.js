function PlanetTracker(socket, bindElement, width, height, position, logLevel) {

    this.socket = socket;
    this.bindElement = bindElement ;
    this.width = width ;
    this.height = height ;
    if (! position){
        // Even if we don't supply position, make sure it defaults to somewhere.
        // In this case, Abu Dhabi, UAE.
        position = {
            lat: 24.47,
            lon: 54.36,
            elevation: 0
        }
    }
    this.position = position ;
    this.position = position ;
    if (! logLevel){
        logLevel = logging.levels.INFO;
    }
    this.logger = new Logger("PlanetTracker", logLevel);
    this.polarPlot = null ;
    this.planetData = null;
    this.rad = 0 ;
    this.planetsSetup = false ;

    this.black = "rgba(0,0,0,{})" ;
    this.hoverTransition = 300 ;
    this.planets = [];
    this.alphaMapper = util.mapRange(7, -27, 0.1, 1);

    this.setup = function(){
        var self = this;
        this.setupSocket();
        this.setupPolarPlot();
        this.getPlanetData();
    }

    this.setupSocket = function(){
        var self = this ;
        this.socket.on("planetTracker.get_planets_cb", function(data){
            self.logger.debug("planetTracker.get_planets_cb: Called.")
            if (! self.planetsSetup){
                self.updatePlanetData.bind(self)(data, self.setupPlanets.bind(self))
            } else {
                self.updatePlanetData.bind(self)(data, self.updatePlanets.bind(self))
            }
        })
    }

    this.setupPolarPlot = function(dim){
        var width ;
        var height ;
        if (! dim){
            width = this.width;
            height = this.height;
        } else {
            width = dim.width ;
            height = dim.height;
        }
        this.logger.debug("setupPolarPlot: Called.")
        this.rad = (Math.min(width, height) / 2) - 30;
        d3.select(this.bindElement).html("")
        this.svg = d3.select(this.bindElement).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        this.staticGroup = this.svg.append("g");
        this.dynamicGroup = this.svg.append("g");
        this.polarPlotGroup = this.svg.append("g");
        var r = d3.scaleLinear()
            .domain([90, 0])
            .range([0, this.rad]);

        this.logger.debug("")
        this.polarPlot = new PolarPlotD3(this.polarPlotGroup, r, this.rad, {ticks:5,
                                                        angularLines:true,
                                                        radialLabels:true});
        this.polarPlot.show();
    }

    this.updatePosition = function(position){
        this.position = position ;
        this.logger.debug("setPosition: new position lat and lon is {}, {}".format(self.pos.lat, self.pos.lon));
    };
    this.getPlanetData = function(){
        this.socket.emit("get_planets", {kwargs: {pos: this.position, cb_info:{
            cb: "planetTracker.get_planets_cb"
        }}})
    }
    // Callbacks
    this.setupPlanets = function(){
        this.planetsSetup = true ;
        this.logger.debug("setupPlanets: Called.")
        this.logger.debug("setupPlanets: First element of this.planetData: {}, ({}, {})".format(
            this.planetData[0].name,
            this.planetData[0].sameDayPos[0].cx,
            this.planetData[0].sameDayPos[0].cy
        ));
        for (var i=0; i<this.planetData.length; i++){
            var planetGroup = this.dynamicGroup.append('g');
            var planet = new D3Planet(this, planetGroup, this.planetData[i]);
            planet.setup();
            this.planets[i] = planet ;
        }
    }

    this.updatePlanets = function(){
        var planet ;
        this.logger.debug1("updatePlanets: Called. this.planetData: {}".format(this.planetData[0].sameDayPos[0].cx))
        for (var i=0; i<this.planetData.length; i++){
            planet = self.planets[i]
            planet.update(planet)(this.planetData[i]);
        }
    };


    this.update = function(){
        this.logger.debug1("PlanetTracker.update: Called.")
        this.logger.debug1("PlanetTracker.update: Position: {}".format(this.position));
        this.getPlanetData();
    }

    this.updatePlanetData = function(data, callbacks){
        var self = this;
        self.logger.debug("updatePlanetData: Called.");
        var planetColor ;
        var strokeWidth ;
        self.planetData = data ;
        self.planetData.forEach(function(d, i){
            d.r = d.size * parseInt((self.rad)/ 50., 10);
            d.sameDayPos.forEach(function(di){
                di.az = di[0];
                di.alt = di[1];
                di.radialPos = (self.rad*((Math.PI/2.0)-Math.abs(di.alt)))/(Math.PI/2.0);
                di.az_adj = di.az - Math.PI/2.0 ;
                di.cx = "{:.4f}".format(di.radialPos*Math.cos(di.az_adj))
                di.cy = "{:.4f}".format(di.radialPos*Math.sin(di.az_adj))
            })
            d.sameTimePos.forEach(function(di){
                di.az = di[0];
                di.alt = di[1];
                di.radialPos = (self.rad*((Math.PI/2.0)-Math.abs(di.alt)))/(Math.PI/2.0);
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
        if (callbacks.constructor === Array){
            callbacks.forEach(function(cb){
                cb();
            })
        }else{
            callbacks();
        }
    }
}
