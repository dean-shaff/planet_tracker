var planetData  ;
var height = $(window).height();
var width = $(window).width();
var rad = Math.min(width, height) / 2 - 100;

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Turn a radian angle into degree
var toDegree = function(radian){
    return (180.*radian)/(Math.PI)
}

// Take the data from the POST request and create the graph.
var processPlanetPositions = function(msg){
    planetData = JSON.parse(msg.result) ;
    // Canvas
    var svg = d3.select('body').append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Center
    svg.append("circle")
      .attr("class", "center")
      .attr("r",5)
      .style("fill", "rgba(0,0,0,0.4)");
    // Horizon
    svg.append("circle")
        .attr("class", "horizon")
        .attr("r", rad)
        .style("fill", "none")
        .style("Stroke", "rgba(0,0,0,0.4)");

    planetData.forEach(function(d){
        d.rad_planet = (rad*((Math.PI/2.0)-Math.abs(d.alt)))/(Math.PI/2.0);
        d.r = 20
        var planetColor ;
        if (d.alt >= 0){
            planetColor = "rgba(255,204,0,1.0)";
        }else{
            planetColor = "rgba(255,204,0,0.4)";
        }
        d.planetColor = planetColor;
//        console.log(d.name, d.az, rad_planet, rad);
        d.az_adj = d.az - Math.PI/2.0 ;
        d.cx = "{:.1f}".format(d.rad_planet*Math.cos(d.az_adj))
        d.cy = "{:.1f}".format(d.rad_planet*Math.sin(d.az_adj))
        console.log(d.name, d.az, d.alt, d.cx, d.cy);
    });
    var divWidth, divHeight, divPadding, divX, divY ;
    var circles = svg.selectAll('circles')
        .data(planetData)
        .enter()
        .append('circle')
            .attr('cx', function(d){return d.cx})
            .attr('cy', function(d){return d.cy})
            .attr('class', function(d){return d.name})
            .attr('r', function(d){return parseFloat(d.r)})
            .attr('stroke', "rgba(0,0,0,0.2)")
            .attr('stroke-width', 0)
//            .attr('transform', function(d){ return "translate({:.4f},{:.4f})".format(d.cx, d.cy) })
            .style("fill", function(d){return d.planetColor})
            .on("mouseover", function(d) {

//                console.log(d3.event.pageX, d3.event.pageY, parseFloat(d.cx) + d.r + width/2,(parseFloat(d.cy) - d.r + height/2))
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg;".format(d.name,toDegree(d.az),toDegree(d.alt)))
                divWidth = parseInt(div.style('width'), 10);
                divHeight = parseInt(div.style('max-height'), 10);
                divPadding = parseInt(div.style('padding'), 10);
                divX = parseFloat(d.cx) + width/2 - divWidth/2 - divPadding/2 ;
                divY = parseFloat(d.cy) + height/2 - divHeight - d.r - divPadding
                div.style("transform","translate({}px,{}px)".format(divX,divY))
                    .style("background", "rgba(0,0,0,0.2)")
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('stroke-width', 2)
             })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('stroke-width', 0)
            })

}

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

var requestPlanetPositionCallback = function(currentPosition){
    console.log(currentPosition);
    $.ajax({
		type:"POST",
		url: $SCRIPT_ROOT+"/get_planets",
		data : JSON.stringify(currentPosition),
		success: function(msg){
			processPlanetPositions(msg)
		},
		failure: function(msg){
			console.log("Failure message from server: "+msg);
		}
	});
}

$(document).ready(function(){
    getPosition(requestPlanetPositionCallback);
});



