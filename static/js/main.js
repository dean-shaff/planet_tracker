var planetData ;
var currentGlobePosition ;
var planetTimer ;
var svg, staticGroup, dynamicGroup;
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

var setPlanetData = function(msg){
    planetData = JSON.parse(msg.result) ;
    planetData.forEach(function(d){
        d.radialPos= (rad*((Math.PI/2.0)-Math.abs(d.alt)))/(Math.PI/2.0);
        d.ry = d.size * parseInt((rad)/ 25., 10);
        d.rx = (d.ry) * ((rad-d.radialPos) / rad);
//        console.log(d.name, d.ry, d.rx, d.radialPos, rad)
        var planetColor ;
        var strokeWidth
//        console.log(d.color.format(1.0));
        if (d.alt >= 0){
            planetColor = d.color.format(0.8);
            strokeWidth = 0 ;
        }else{
            planetColor = d.color.format(0.0);
            strokeWidth = 1 ;
        }
        d.planetColor = planetColor;
        d.strokeWidth = strokeWidth;
//        console.log(d.name, d.az, rad_planet, rad);
        d.az_adj = d.az - Math.PI/2.0 ;
        d.cx = "{:.4f}".format(d.radialPos*Math.cos(d.az_adj))
        d.cy = "{:.4f}".format(d.radialPos*Math.sin(d.az_adj))
//        console.log(d.name, d.az, d.alt, d.cx, d.cy);
    });
    updatePlanetPlot()
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

    // Center
    staticGroup.append("circle")
      .attr("class", "center")
      .attr("r",2)
      .style("fill", "rgba(0,0,0,0.4)");
    // Horizon
    staticGroup.append("circle")
        .attr("class", "horizon")
        .attr("r", rad)
        .style("fill", "none")
        .style("Stroke", "rgba(0,0,0,0.4)");

//    staticGroup.append("ellipse")
//        .attr('rx', 10)
//        .attr('ry', 15)
//        .attr('transform', 'translate(100, 100)')
//        .attr('transform', 'rotate(45)')
//        .style("fill", "blue")

    dynamicGroup = svg.append("g");
}

var mouseOverCallback = function(d){
    div.transition()
        .duration(200)
        .style("opacity", .9);
    divWidth = parseInt(div.style('width'), 10);
    divHeight = parseInt(div.style('max-height'), 10);
    divPadding = parseInt(div.style('padding'), 10);
    divX = parseInt(parseFloat(d.cx) + width/2 - divWidth/2 - divPadding/2, 10);
    divY = parseInt(parseFloat(d.cy) + height/2 - divHeight - d.ry - divPadding, 10);
//    console.log(divX, divY);
    div.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg;".format(d.name,toDegree(d.az),toDegree(d.alt)))
        .style("transform","translate({}px,{}px)".format(divX,divY))
        .style("background", "rgba(0,0,0,0.2)")
//    console.log(div.style('left'), div.style('top'))
    d3.select(this)
        .transition()
        .duration(200)
        .attr('stroke-width', 2)
}

var mouseOutCallback = function(d){
    div.transition()
        .duration(200)
        .style("opacity", 0);
    d3.select(this)
        .transition()
        .duration(200)
        .attr('stroke-width', d.strokeWidth)
}


var updatePlanetPlot = function(){
    var divWidth, divHeight, divPadding, divX, divY ;
    var circles = dynamicGroup.selectAll('circle')
        .data(planetData)

    circles.exit().remove() ;
    circles.enter().append('circle')
        .attr('cx', function(d){return d.cx})
        .attr('cy', function(d){return d.cy})
        .attr('class', function(d){return d.name})
        .attr('r', function(d){return parseFloat(d.ry)})
        .attr('stroke', "rgba(0,0,0,0.2)")
        .attr('stroke-width', function(d){return d.strokeWidth})
        .style("fill", function(d){return d.planetColor})
        .on("mouseover", mouseOverCallback)
        .on("mouseout", mouseOutCallback)

    circles.merge(circles)
        .attr('cx', function(d){return d.cx})
        .attr('cy', function(d){return d.cy})
        .attr('class', function(d){return d.name})
        .attr('r', function(d){return d.ry})
        .attr('stroke', "rgba(0,0,0,0.2)")
        .attr('stroke-width', function(d){return d.strokeWidth})
        .style("fill", function(d){return d.planetColor})
        .on("mouseover", mouseOverCallback)
        .on("mouseout", mouseOutCallback)
}

planetTimer = setInterval(function(){
    requestPlanetPosition(currentGlobePosition);
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

var requestPlanetPosition = function(currentPosition){
    currentGlobePosition = currentPosition ;
    currentPosition.continuous = false;
    $.ajax({
		type:"POST",
		url: $SCRIPT_ROOT+"/get_planets",
		data : JSON.stringify(currentPosition),
		success: function(msg){
			setPlanetData(msg)
		},
		failure: function(msg){
			console.log("Failure message from server: "+msg);
		}
	});
}

$(document).ready(function(){
    setupPlanetPlot()
    setupAbout();
    getPosition(requestPlanetPosition);
});



