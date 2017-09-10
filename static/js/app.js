function App(socket, updateRate, logLevel){

    this.socket = socket ;
    this.updateRate = updateRate ;
    this.height = $(window).height();
    this.width = $(window).width();
    this.radius = null ;
    this.pos = {};
    this.logger = new Logger("App", logLevel);

    this.init = function() {
        var self = this;
        this.logger.debug("init: Called");
        this.setupSocket();
        this.setup();
        // this.timer = setInterval(this.update(self), this.updateRate);
    }
    this.updateSocket = function(socket){
        this.socket = socket ;
    }
    this.setupSocket = function(socket){
        var self = this ;
        // this.socket.on("get_planets_cb", function(data){
        //     console.log("get_planets_cb: Called.")
        //     self.setup(self)(data);
        // })
    }

    this.getPosition = function(callbacks){
        this.logger.debug("getPosition: Called.")
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                function(position){
                    var pos = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        elevation: 0,
                        continuous: false
                    }
                    callbacks.forEach(function(callback){
                        callback(pos) ;
                    })
                },
                function(error){
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            console.log("User denied the request for Geolocation.") ;
                            break;
                        case error.POSITION_UNAVAILABLE:
                            console.log("Location information is unavailable.") ;
                            break;
                        case error.TIMEOUT:
                            console.log("The request to get user location timed out.") ;
                            break;
                        case error.UNKNOWN_ERROR:
                            console.log("An unknown error occurred.")
                            break;
                    }
                });
        } else {
            this.logger.error("Browser doesn't support geolocation");
        } ;
    };

    // Below we define callback functions that get used.



    this.makeInitRequest = function(self){
        return function(pos){
            self.logger.debug("makeInitRequest: Called.")
            self.socket.emit("get_planets", {kwargs: {pos: pos, cb_info:{
                cb: "get_planets_cb"
            }}})
        };
    };

    this.update = function(self){
        return function(){
            self.planetTracker.update(self.planetTracker)() ;
        };
    };

    this.setupAbout =  function(){
        var self = this ;
        var aboutHTML = `
        <h6>Hover the mouse over objects to see
        their name, current position in the sky, and approximate setting time.<br>
        Hovering will also show the position of the object at the same time for the next 2 weeks.<br>
        Setting times are displayed in UTC time.<br>
        Objects that are just outlines are below the horizon.</h6>
        `
        self.aboutTooltipDiv = d3.select("#title-bar").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0.0)
        //    .style("background", "rgba(200,200,200,1.0)")
            .style("background","rgba(255,255,255,1.0)")
            .style("width", d3.select("#planet-plot").style('width'))
            .style("max-height", "500px")
            .html(aboutHTML)
            .style('transform', 'translate({}px,{})'.format(0,d3.select("#title").style('height')))

        var aboutDiv = $("#about") ;
        aboutDiv.mouseover(function(){
            self.aboutTooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);
            $("#about h4").css("color", "#ce0e25")
        }) ;

        aboutDiv.mouseout(function(){
            self.aboutTooltipDiv.transition()
                .duration(200)
                .style("opacity", 0);
            $("#about h4").css("color", "#222")
        }) ;

    }

    this.setupPolarPlot = function(){
        self.rad = (Math.min(self.width, self.height) / 2) - 40;
        self.svg = d3.select('body').append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .append("g")
            .attr("transform", "translate(" + self.width / 2 + "," + self.height / 2 + ")");
        self.staticGroup = self.svg.append("g");
        self.dynamicGroup = self.svg.append("g");
        self.polarPlotGroup = self.svg.append("g");
        var r = d3.scaleLinear()
            .domain([90, 0])
            .range([0, self.rad]);

        self.logger.debug("")
        self.polarPlot = new PolarPlotD3(self.polarPlotGroup, r, self.rad, {ticks:5,
                                                        angularLines:true,
                                                        radialLabels:true});
        self.polarPlot.show();
    }

    this.setPosition =function(position){
        this.pos = position ;
        this.logger.debug("setPosition: new position lat and lon is {}, {}".format(self.pos.lat, self.pos.lon));
    };

    this.setupPlanetTracker = function(position){
        this.pos = position ;
        this.planetTracker = new PlanetTracker(this.socket, position, {}, this.dynamicGroup,
                                                    this.rad, this.width, this.height, this.logger.level);

        this.planetTracker.setup() ;
    }

    this.setup = function(){
        this.setupAbout() ;
        this.setupPolarPlot() ;
        this.getPosition([this.setPosition.bind(this), this.setupPlanetTracker.bind(this)]) ;
    }

}

$(document).ready(function(){
    var app ;
    var port = location.port;
    var domain= document.domain;
    var socket = io.connect("http://{}:{}".format(domain, port));
    app = new App(socket, 5000, "DEBUG") ;
    socket.on('connect', function(){
        console.info("Updating App's socket connection");
        app.updateSocket(socket);
    })
    app.init()
})
