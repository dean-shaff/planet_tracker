debugMode = false;

var util = {
    requestData: function(route, position, callbacks){
        // console.log("Route: {}, Position: {}".format(route, position));
        position.continuous = debugMode ;
        $.ajax({
            type:"POST",
            url: $SCRIPT_ROOT+route,
            data : JSON.stringify(position),
            success: function(msg){
                var data = JSON.parse(msg.result);
                // console.log(data[0].name);
                callbacks.forEach(function(callback){
                    callback(data) ;
                })
            },
            failure: function(msg){
                console.log("Failure message from server: "+msg);
            }
        });
    },
}


function App(updateRate, logLevel){

    this.updateRate = updateRate ;
    this.height = $(window).height();
    this.width = $(window).width();
    this.rad = (Math.min(this.width, this.height) / 2) - 50;
    this.pos = {};
    this.logger = new Logger("App", logLevel);

    this.init = function() {
        var self = this;
        this.logger.debug("init: Called");
        this.getPosition([this.setPosition(self), this.makeInitRequest(self)]) ;
        this.timer = setInterval(this.update(self), this.updateRate);
    };

    this.setupAbout = function(){
        var aboutHTML = `
        <h6>Hover the mouse over objects to see
        their name and current position in the sky. <br>
        Hovering will also show the path of the planet until it reaches the horizon. <br>
        Objects that are just outlines are below the horizon. <br>
        Hover the mouse over the horizon see the paths of all the planets.</h6>
        `
        this.aboutTooltipDiv = d3.select("#title-bar").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0.0)
        //    .style("background", "rgba(200,200,200,1.0)")
            .style("background","rgba(255,255,255,1.0)")
            .style("width", d3.select("#planet-plot").style('width'))
            .style("max-height", "500px")
            .html(aboutHTML)
            .style('transform', 'translate({}px,{})'.format(0,d3.select("#title").style('height')))

        var self = this ;
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
    };


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
    this.setPosition = function(self){
        return function(pos){
            self.pos = pos ;
            self.logger.debug("setPosition: new position lat and lon is {}, {}".format(self.pos.lat, self.pos.lon));
        };
    }

    this.makeInitRequest = function(self){
        return function(pos){
            self.logger.debug("makeInitRequest: Called.")
            util.requestData("/get_planets", pos, [self.setup(self)]);
        };
    };

    this.update = function(self){
        return function(){
            self.planetTracker.update(self.planetTracker)() ;
        };
    };

    this.setup = function(self){
        return function(data){
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

            self.setupAbout();

            self.polarPlot = new PolarPlotD3(self.polarPlotGroup, r, self.rad, {ticks:5,
                                                            angularLines:true,
                                                            radialLabels:true});
            self.polarPlot.show();
            self.planetTracker = new PlanetTracker(self.pos, data, self.dynamicGroup,
                                                        self.rad, self.width, self.height, self.logger.level);

            self.planetTracker.setup() ;
            // self.polarPlot.outerArc
            //     .on('mouseover', function(){
            //         self.polarPlot.outerCircle
            //             .transition()
            //             .duration(self.planetTracker.hoverTransition)
            //             .style('stroke-width',2);
            //         self.planetTracker.showSettingTimes();
            // })
            //     .on('mouseout', function(){
            //         self.polarPlot.outerCircle
            //             .transition()
            //             .duration(self.planetTracker.hoverTransition)
            //             .style('stroke-width',1);
            //         self.planetTracker.hideSettingTimes();
            // })


        };
    }

}

app = new App(2000, "DEBUG") ;
app.init()