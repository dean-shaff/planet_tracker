var planetData ;
var currentGlobePosition ;
var planetTimer ;
var svg, staticGroup, dynamicGroup, polarPlot, polarPlotGroup;
var height = $(window).height();
var width = $(window).width();
var rad = (Math.min(width, height) / 2) - 50;
var updateRate = 4000 ;
var hoverTransition = 300 ;
var black = "rgba(0,0,0,{})"

// Define the div for the planet information tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Define the div for the About tooltip
var aboutTooltipDiv = d3.select("#about").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background", "rgba(0,0,0,0.2)")
    .style("width", "200px")
    .style("max-height", "200px")
    .html(`Hover the mouse over objects to see
           their name and current position in the sky.
           Hovering will also show the path of the planet until it reaches the horizon
           and its position at the same time for the next fortnight.
           Objects that are just outlines are below the horizon.
           Hover the mouse over the horizon to see a polar plot,
           in addition to all the paths of the planets.`)
    .style('transform', 'translate({}px,{}px)'.format(-50,0))

var divInitX = parseFloat(div.style('left'));
var divInitY = parseFloat(div.style('top'));

// Turn a radian angle into degree
var toDegree = function(radian){
    return (180.*radian)/(Math.PI)
}
// Line function to get data from planetData object
var planetDataLineGenerator = d3.line()
                        .x(function(d){return d.cx})
                        .y(function(d){return d.cy})

var setPlanetData = function(msg, callbackFunction){
//    console.log("setPlanetData: Called.")
    planetData = JSON.parse(msg.result) ;
    planetData.forEach(function(d, i ){
        d.r = d.size * parseInt((rad)/ 25., 10);
//        if (i == 0){
//            console.log(d.sameDayPos[0]);
//        }
        d.sameDayPos.forEach(function(di){
            di.az = di[0];
            di.alt = di[1];
            di.radialPos = (rad*((Math.PI/2.0)-Math.abs(di.alt)))/(Math.PI/2.0);
            di.az_adj = di.az - Math.PI/2.0 ;
            di.cx = "{:.4f}".format(di.radialPos*Math.cos(di.az_adj))
            di.cy = "{:.4f}".format(di.radialPos*Math.sin(di.az_adj))
        })
//        if (i == 0){
//            console.log(d.sameDayPos[0]);
//        }
        d.sameTimePos.forEach(function(di){
            di.az = di[0];
            di.alt = di[1];
            di.radialPos = (rad*((Math.PI/2.0)-Math.abs(di.alt)))/(Math.PI/2.0);
            di.az_adj = di.az - Math.PI/2.0 ;
            di.cx = "{:.4f}".format(di.radialPos*Math.cos(di.az_adj))
            di.cy = "{:.4f}".format(di.radialPos*Math.sin(di.az_adj))
            di.r = d.r
        })

        var planetColor ;
        var strokeWidth
        if (d.sameDayPos[0].alt >= 0){
            planetColor = d.color.format(0.8);
            strokeWidth = 0 ;
        }else{
            planetColor = d.color.format(0.0);
            strokeWidth = 1 ;
        }
        d.planetColor = planetColor;
        d.strokeWidth = strokeWidth;
    });
    callbackFunction()
}

var setupAbout = function(){
    var aboutDiv = $("#about") ;
    var origText = aboutDiv.html();
    about
    aboutDiv.mouseover(function(){
        aboutTooltipDiv.transition()
            .duration(200)
            .style("opacity", .9);
        $("#about h4").css("color", "#ce0e25")
    }) ;

    aboutDiv.mouseout(function(){
        aboutTooltipDiv.transition()
            .duration(200)
            .style("opacity", 0);
        $("#about h4").css("color", "#222")
    }) ;
}


var setupPlanetPlot = function(){
    // Canvas
    svg = d3.select('body').append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    staticGroup = svg.append("g");
    dynamicGroup = svg.append("g");
    polarPlotGroup = svg.append("g")
    var r = d3.scaleLinear()
        .domain([90, 0])
        .range([0, rad]);
    polarPlot = new PolarPlotD3(polarPlotGroup, r, rad, {ticks:5,
                                                        angularLines:true,
                                                        radialLabels:true});
    polarPlot.show();
    // Center
    staticGroup.append("circle")
      .attr("class", "center")
      .attr("r",2)
      .style("fill", "rgba(0,0,0,0.4)");

    var circleGroup = dynamicGroup.selectAll('circle')
        .data(planetData)

    var pathGroup = dynamicGroup.selectAll('path')
        .data(planetData)

    circleGroup.enter().append('circle')
        .attr('cx', function(d){return d.sameDayPos[0].cx})
        .attr('cy', function(d){return d.sameDayPos[0].cy})
        .attr('class', function(d){return d.name})
        .attr('r', function(d){return parseFloat(d.r)})
        .attr('stroke', "rgba(0,0,0,0.2)")
        .attr('stroke-width', function(d){return d.strokeWidth})
        .style("fill", function(d){return d.planetColor})
        .on("mouseover", mouseOverCallback)
        .on("mouseout", mouseOutCallback)

    pathGroup.enter().append("path")
        .style("stroke", black.format(0.0))
        .style("stroke-width", 2)
        .attr("fill", "none")
        .attr("d",function(d){return planetDataLineGenerator(d.sameDayPos)})

    planetData.forEach(function(d, i){
        var grpi = dynamicGroup.append('g')
            .attr('id', "future{}".format(i))
        grpi.selectAll('circle').data(d.sameTimePos)
            .enter().append('circle')
            .attr('cx', function(di){return di.cx})
            .attr('cy', function(di){return di.cy})
            .attr('r', function(di){return 0.2*di.r})
            .style("fill", black.format(0.0))
    })

    // Horizon
    var tolerance = 15
    var largeArc = d3.arc()
        .innerRadius(rad - tolerance)
        .outerRadius(rad + tolerance)
        .startAngle(0)
        .endAngle(2*Math.PI)

    staticGroup.append('path')
        .attr('d', largeArc)
        .attr('id', 'horizon')
        .style("fill", "rgba(0,0,0,0.0)")
        .style("stroke", "none")
        .on('mouseover', function(){
            dynamicGroup.selectAll('path')
                .transition()
                .duration(hoverTransition)
                .style("stroke", function(d){return black.format(0.2)})
//            polarPlot.show(hoverTransition);
        })
        .on('mouseout', function(){
            dynamicGroup.selectAll('path')
                .transition()
                .duration(hoverTransition)
                .style("stroke", function(d){return black.format(0.0)})
//            polarPlot.hide(hoverTransition);
        })
    // now put the visible circle
    staticGroup.append('circle')
        .style("stroke", "rgba(0,0,0,0.4")
        .style('fill', 'none')
        .attr('r', rad)

}

var updatePlanetPlot = function(){
//    console.log("updatePlanetPlot: Called.")
    var planetGroup = dynamicGroup.selectAll('circle')
        .data(planetData)
    var pathGroup = dynamicGroup.selectAll('path')
        .data(planetData)

    planetGroup.exit().remove();
    planetGroup.merge(planetGroup)
        .attr('cx', function(d){return d.sameDayPos[0].cx})
        .attr('cy', function(d){return d.sameDayPos[0].cy})
        .attr('class', function(d){return d.name})
        .attr('r', function(d){return parseFloat(d.r)})
        .attr('stroke', "rgba(0,0,0,0.2)")
        .attr('stroke-width', function(d){return d.strokeWidth})
        .style("fill", function(d){return d.planetColor})
        .on("mouseover", mouseOverCallback)
        .on("mouseout", mouseOutCallback)

    pathGroup.exit().remove();
    pathGroup.merge(pathGroup)
        .style("stroke", black.format(0.0))
        .style("stroke-width", 2)
        .attr("fill", "none")
        .attr("d",function(d){return planetDataLineGenerator(d.sameDayPos)})

//    planetData.forEach(function(d, i){
//        var futurePlanetGroup = document.querySelector('#future{}'.format(i));
//        var circleNodes = futurePlanetGroup.getElementsByTagName('circle');
//        d3.selectAll(circleNodes).data(d.sameTimePos).merge(d3.selectAll(circleNodes))
//            .attr('cx', function(di){return di.cx})
//            .attr('cy', function(di){return di.cy})
//            .attr('r', function(di){return 0.2*di.r})
//            .style("fill", black.format(0.0))
//    })

}

var mouseOverCallback = function(d, i){
    div.transition()
        .duration(200)
        .style("opacity", .9);
    var divWidth = parseInt(div.style('width'), 10);
    var divHeight = parseInt(div.style('max-height'), 10);
    var divPadding = parseInt(div.style('padding'), 10);
    var divX = parseInt(parseFloat(d.sameDayPos[0].cx) + width/2 - divWidth/2 - divPadding/2, 10);
    var divY = parseInt(parseFloat(d.sameDayPos[0].cy) + height/2 - divHeight - d.r - divPadding, 10);
//    console.log(planetData[0].sameDayPos[0]);
//    console.log(divX, divY);
//    console.log(d.sameDayPos[0]);
    div.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg;".format(d.name,toDegree(d.sameDayPos[0].az),toDegree(d.sameDayPos[0].alt)))
        .style("transform","translate({}px,{}px)".format(divX,divY))
        .style("background", "rgba(0,0,0,0.2)")
//    console.log(div.style('left'), div.style('top'))
    d3.select(this)
        .transition()
        .duration(hoverTransition)
//        .style('fill', black.format(0.2))
        .attr('stroke-width', 2)

    d3.select(this.parentNode).selectAll('path')
        .transition()
        .duration(hoverTransition)
        .style("stroke", function(di, ind){
                            if (ind == i){
                                return black.format(0.2)
                            } else
                                return black.format(0.0)
         })

    var futurePlanetGroup = document.querySelector('#future{}'.format(i));
    var circleNodes = futurePlanetGroup.getElementsByTagName('circle');
    d3.selectAll(circleNodes)
        .transition()
        .duration(hoverTransition)
        .style('fill', black.format(0.2))
}

var mouseOutCallback = function(d, i){
    div.transition()
        .duration(hoverTransition)
        .style("opacity", 0);
    d3.select(this)
        .transition()
        .duration(hoverTransition)
//        .style('fill', d.planetColor)
        .attr('stroke-width', d.strokeWidth);
    d3.select(this.parentNode).selectAll('path')
        .transition()
        .duration(hoverTransition)
        .style("stroke", function(di, ind){return black.format(0.0)});

    var futurePlanetGroup = document.querySelector('#future{}'.format(i));
    var circleNodes = futurePlanetGroup.getElementsByTagName('circle');
    d3.selectAll(circleNodes)
        .transition()
        .duration(hoverTransition)
        .style('fill', black.format(0.0))
}


planetTimer = setInterval(function(){
    requestPlanetPosition(currentGlobePosition, updatePlanetPlot);
}, updateRate);

var getPosition = function(callback){
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            var pos = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                elevation: 0
            }
            console.log("Geolocation: lat {:.4f} lon {:.4f}".format(pos.lat, pos.lon))
            callback(pos)
        }, function () {
            console.log("Couldn't get geolocation. Defaulting to NYUAD");
            var pos = {lat:24.523920,
                       lon:54.432948,
                       elevation: 0}
            callback(pos)
        });
    } else {
        console.log("Browser doesn't support geolocation");
    }
}

var setGlobalPosition = function(currentPosition){
    currentGlobePosition = currentPosition
    requestPlanetPosition(currentGlobePosition, setupPlanetPlot)
}

var requestPlanetPosition = function(currentPosition, callback){
//    console.log("requestPlanetPosition: Called.")
    if (typeof currentPosition == 'undefined'){
        currentPosition = {lat:24.523920,
                           lon:54.432948,
                           elevation: 0} // NYUAD
    }
    currentPosition.continuous = false;
    $.ajax({
		type:"POST",
		url: $SCRIPT_ROOT+"/get_planets",
		data : JSON.stringify(currentPosition),
		success: function(msg){
			setPlanetData(msg, callback)
		},
		failure: function(msg){
			console.log("Failure message from server: "+msg);
		}
	});
}

$(document).ready(function(){
    setupAbout();
    getPosition(setGlobalPosition);
});
