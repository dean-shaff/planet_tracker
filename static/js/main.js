var planetData ;
var currentGlobePosition ;
var planetTimer ;
var svg, staticGroup, dynamicGroup ;
var height = $(window).height();
var width = $(window).width();
var rad = Math.min(width, height) / 2 - 40;
var updateRate = 2000 ;

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var aboutTooltipDiv = d3.select("#about").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background", "rgba(0,0,0,0.2)")
    .style("width", "180px")
    .style("max-height", "200px")
    .html(`Hover the mouse over objects to see
           their name and current position in the sky.
           Objects that are just outlines are below the horizon.`)

var divInitX = parseFloat(div.style('left'));
var divInitY = parseFloat(div.style('top'));

// Turn a radian angle into degree
var toDegree = function(radian){
    return (180.*radian)/(Math.PI)
}
// Line function to get data from planetData object
var planetDataLineFunction = d3.line()
                        .x(function(d){return d.cx})
                        .y(function(d){return d.cy})


var setPlanetData = function(msg, callbackFunction){
    planetData = JSON.parse(msg.result) ;
    planetData.forEach(function(d){
        d.sameDayPos.forEach(function(d){
            d.az = d[0];
            d.alt = d[1];
            d.radialPos = (rad*((Math.PI/2.0)-Math.abs(d.alt)))/(Math.PI/2.0);
            d.az_adj = d.az - Math.PI/2.0 ;
            d.cx = "{:.4f}".format(d.radialPos*Math.cos(d.az_adj))
            d.cy = "{:.4f}".format(d.radialPos*Math.sin(d.az_adj))
        })
        d.sameTimePos.forEach(function(d){
            d.az = d[0];
            d.alt = d[1];
            d.radialPos = (rad*((Math.PI/2.0)-Math.abs(d.alt)))/(Math.PI/2.0);
            d.az_adj = d.az - Math.PI/2.0 ;
            d.cx = "{:.4f}".format(d.radialPos*Math.cos(d.az_adj))
            d.cy = "{:.4f}".format(d.radialPos*Math.sin(d.az_adj))
        })
        d.ry = d.size * parseInt((rad)/ 25., 10);
        d.rx = (d.ry) * ((rad-d.radialPos) / rad);
//        console.log(d.name, d.ry, d.rx, d.radialPos, rad)
        var planetColor ;
        var strokeWidth
//        console.log(d.color.format(1.0));
        if (d.sameDayPos[1].alt >= 0){
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
    // Center
    staticGroup.append("circle")
      .attr("class", "center")
      .attr("r",2)
      .style("fill", "rgba(0,0,0,0.4)");

    // Directions, NWSE not implemented yet

    var planetGroup = dynamicGroup.selectAll('g')
        .data(planetData)

    planetGroup.enter().append('circle')
        .attr('cx', function(d){return d.sameDayPos[0].cx})
        .attr('cy', function(d){return d.sameDayPos[0].cy})
        .attr('class', function(d){return d.name})
        .attr('r', function(d){return parseFloat(d.ry)})
        .attr('stroke', "rgba(0,0,0,0.2)")
        .attr('stroke-width', function(d){return d.strokeWidth})
        .style("fill", function(d){return d.planetColor})
        .on("mouseover", mouseOverCallback)
        .on("mouseout", mouseOutCallback)

    planetGroup.enter().append("path")
        .style("stroke", function(d){return d.color.format(0.0)})
        .style("stroke-width", 2)
        .attr("fill", "none")
        .attr("d",function(d){return planetDataLineFunction(d.sameDayPos)})

    // Horizon
    var tolerance = 8
    var largeArc = d3.arc()
        .innerRadius(rad - tolerance)
        .outerRadius(rad + tolerance)
        .startAngle(0)
        .endAngle(2*Math.PI)

    staticGroup.append('path')
        .attr('d', largeArc)
        .style("fill", "rgba(0,0,0,0.0)")
        .style("stroke", "none")
        .on('mouseover', function(){
            dynamicGroup.selectAll('path')
                .transition()
                .duration(300)
                .style("stroke", function(d){return d.color.format(0.3)})
        })
        .on('mouseout', function(){
            dynamicGroup.selectAll('path')
                .transition()
                .duration(300)
                .style("stroke", function(d){return d.color.format(0.0)})
        })

    staticGroup.append('circle')
        .style("stroke", "rgba(0,0,0,0.4")
        .style('fill', 'none')
        .attr('r', rad)
}

var updatePlanetPlot = function(){

//    var pathGroup = dynamicGroup.selectAll('g')
//    pathGroup.merge(pathGroup)
//        .style("stroke", function(d){return d.color.format(0.2)})
//        .style("stroke-width", 1)
//        .attr("fill", "none")
//        .attr("d",function(d){return planetDataLineFunction(d.sameDayPos)}) ;
//    pathGroup.exit().remove() ;

    var planetGroup = dynamicGroup.selectAll('g')
    planetGroup.merge(planetGroup)
//        .attr('cx', function(d){return d.sameDayPos[0].cx})
//        .attr('cy', function(d){return d.sameDayPos[0].cy})
//        .attr('class', function(d){return d.name})
//        .attr('r', function(d){return d.ry})
//        .attr('stroke', "rgba(0,0,0,0.2)")
//        .attr('stroke-width', function(d){return d.strokeWidth})
//        .style("fill", function(d){return d.planetColor})
//        .on("mouseover", mouseOverCallback)
//        .on("mouseout", mouseOutCallback) ;
    planetGroup.exit().remove() ;
}

var mouseOverCallback = function(d, i){
    div.transition()
        .duration(200)
        .style("opacity", .9);
    var divWidth = parseInt(div.style('width'), 10);
    var divHeight = parseInt(div.style('max-height'), 10);
    var divPadding = parseInt(div.style('padding'), 10);
    var divX = parseInt(parseFloat(d.sameDayPos[0].cx) + width/2 - divWidth/2 - divPadding/2, 10);
    var divY = parseInt(parseFloat(d.sameDayPos[0].cy) + height/2 - divHeight - d.ry - divPadding, 10);
//    console.log(divX, divY);
    div.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg;".format(d.name,toDegree(d.sameDayPos[0].az),toDegree(d.sameDayPos[0].alt)))
        .style("transform","translate({}px,{}px)".format(divX,divY))
        .style("background", "rgba(0,0,0,0.2)")
//    console.log(div.style('left'), div.style('top'))
    d3.select(this)
        .transition()
        .duration(300)
        .attr('stroke-width', 2)

    d3.select(this.parentNode).selectAll('path')
        .transition()
        .duration(300)
        .style("stroke", function(di, ind){
                            if (ind == i){
                                return di.color.format(0.3)
                            } else
                                return di.color.format(0.0)})

}

var mouseOutCallback = function(d){
    div.transition()
        .duration(200)
        .style("opacity", 0);
    d3.select(this)
        .transition()
        .duration(200)
        .attr('stroke-width', d.strokeWidth)
    d3.select(this.parentNode).selectAll('path')
        .transition()
        .duration(300)
        .style("stroke", function(di, ind){return di.color.format(0.0)})
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
            callback(pos)
        }, function () {
            console.log("Couldn't get geolocation.");
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



