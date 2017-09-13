function PlanetTracker(parent, socket, plotBindElement, listBindElement, width, height, position, logLevel, mobile) {

    this.parent = parent ;
    this.socket = socket;
    this.plotBindElement = plotBindElement ;
    this.listBindElement = listBindElement ;
    this.width = width ;
    this.height = height ;
    this.mobile = mobile
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
    this.polarPlotTransform = {x:0, y:0};
    this.planetData = null;
    this.rad = 0 ;
    this.planetsSetup = false ;

    this.black = "rgba(0,0,0,{})" ;
    this.hoverTransition = 300 ;
    this.planets = [];
    this.alphaMapper = util.mapRange(7, -27, 0.1, 1);
    this.timer = null ;

    this.setup = function(){
        this.setupSocket();
        this.setupPolarPlot();
        this.getPlanetData();
    }

    this.setupSocket = function(){
        var self = this ;
        this.socket.on("planetTracker.get_planets_cb", function(data){
            self.logger.debug("planetTracker.get_planets_cb: Called.")
            if (! self.planetsSetup){
                self.updatePlanetData.bind(self)(data, [self.setupPlanets.bind(self), self.setupPlanetList.bind(self)])
            } else {
                self.updatePlanetData.bind(self)(data, [self.updatePlanets.bind(self), self.updatePlanetList.bind(self)])
            }
        })
    }

    this.updateSocket = function(socket){
        this.socket = socket ;
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
        this.polarPlotTransform.x = width /2 ;
        this.polarPlotTransform.y = this.rad + 20 ;
        d3.select(this.plotBindElement).html("")
        this.svg = d3.select(this.plotBindElement).append("svg")
            .attr("id", "polar-plot")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${this.polarPlotTransform.x}, ${this.polarPlotTransform.y})`);
        this.staticGroup = this.svg.append("g");
        this.dynamicGroup = this.svg.append("g");
        this.polarPlotGroup = this.svg.append("g");
        var r = d3.scaleLinear()
            .domain([90, 0])
            .range([0, this.rad]);

        this.polarPlot = new PolarPlotD3(this.polarPlotGroup, r, this.rad, {ticks:5,
                                                        angularLines:true,
                                                        radialLabels:true});
        this.polarPlot.show();
        this.planetsSetup = false;
    }

    this.updatePosition = function(position){
        this.position = position ;
        this.logger.debug("setPosition: new position lat and lon is {}, {}".format(self.pos.lat, self.pos.lon));
    };

    this.getPlanetData = function(){
        this.logger.debug("getPlanetData: Called.")
        this.socket.emit("get_planets", {kwargs: {pos: this.position, cb_info:{
            cb: "planetTracker.get_planets_cb"
        }}})
    }

    this.setupPlanets = function(){
        this.planetsSetup = true ;
        this.logger.debug("setupPlanets: First element of this.planetData: {}, ({}, {})".format(
            this.planetData[0].name,
            this.planetData[0].sameDayPos[0].cx,
            this.planetData[0].sameDayPos[0].cy
        ));
        for (var i=0; i<this.planetData.length; i++){
            var planetGroup = this.dynamicGroup.append('g')
                .attr("class", this.planetData[i].name)
            var planet = new D3Planet(this, planetGroup, this.planetData[i]);
            planet.setup();
            this.planets[i] = planet ;
        }
    }

    this.updatePlanets = function(){
        this.logger.debug("updatePlanets: Called.")
        var planet ;
        for (var i=0; i<this.planetData.length; i++){
            planet = this.planets[i]
            planet.update(planet)(this.planetData[i]);
        }
    };

    this.updatePlot = function(dim){
        this.logger.debug("updatePlot: Called.")
        this.setupPolarPlot(dim);
        if (this.planetData){
            this.updatePlanetData(this.planetData, this.setupPlanets.bind(this))
        }
    }

    this.update = function(){
        this.logger.debug("PlanetTracker.update: Called.")
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

    this.updatePlanetList = function(){
        var self = this ;
        this.planetData.forEach(function(d){
            $(`#${d.name} > #az`).html(`${util.toDegree(d.sameDayPos[0].az).toFixed(2)}`);
            $(`#${d.name} > #alt`).html(`${util.toDegree(d.sameDayPos[0].alt).toFixed(2)}`);
            $(`#${d.name} > #setting-time`).html(`${d.setting_time}`);
        })
    }

    this.setupPlanetList = function(){
        var self = this;
        this.logger.debug("setupPlanetList: Called.")
        this.planetData.forEach(function(d){
            // $(self.listBindElement).append(`<tbody>
            //                                     <tr id='${d.name}'>
            //                                         <th>${d.name}</th>
            //                                         <td id='az'>${util.toDegree(d.sameDayPos[0].az).toFixed(2)}</td>
            //                                         <td id='alt'>${util.toDegree(d.sameDayPos[0].alt).toFixed(2)}</td>
            //                                         <td id='setting-time'>${d.setting_time}</td>
            //                                     </tr>
            //                                 </tbody>`)
            //
            $(self.listBindElement).append(`<button id='${d.name}' class='u-full-width'>${d.name}</button>`)
        })
        $(self.listBindElement).on("click", "button", function(){
            var name = $(this).attr("id");
            self.planets.forEach(function(d){
                if (d.name == name){
                    self.logger.debug(`Clicking on table element for planet ${d.name}`);
                    d.mouseClick(d)();
                }
            })
        })
    }

}
