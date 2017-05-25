function PolarPlotD3(extendGroup, rFunction, radius, kwargs){

    var radius = radius ;
    var extendGroup = extendGroup;
    var rFunction = rFunction ;
    var kwargs = kwargs;

    this.setup = function(){

        var polarPlotRadial = extendGroup.append("g")
            .attr("class", "r axis")
            .selectAll("g")
            .data(rFunction.ticks(kwargs.ticks).slice(1))
            .enter().append("g");

        polarPlotRadial.append("circle")
            .attr("r", rFunction);

        if (kwargs.radialLabels) {
            polarPlotRadial.append("text")
                .attr("y", function(d) { return - rFunction(d) - 4; })
                .attr("transform", "rotate(15)")
                .style("text-anchor", "middle")
                .text(function(d) { return d+ "°"; });
        }

        var polarPlotAngular = extendGroup.append("g")
            .attr("class", "a axis")
            .selectAll("g")
            .data(d3.range(0, 360, 30))
                .enter().append("g")
                .attr("transform", function(d) { return "rotate({})".format(d-90); });

        if (kwargs.angularLines) {
            polarPlotAngular.append("line")
                .attr("x2", radius);
        }

        polarPlotAngular.append("text")
            .attr("x", radius + 6)
            .attr("dy", ".35em")
            .style("text-anchor", function(d) {
                if (d < 360 && d > 180){
                    return "end" ;
                }else{
                    return null ;
                }
            })
            .attr("transform", function(d){
                if (d < 360 && d > 180){
                    return "rotate(180 {}, 0)".format(radius + 6) ;
                }
//                else if (d == 0) {
//                    return "rotate(90 {}, 0)".format(radius + 6) ;
//                }
                else {
                    return null ;
                }
            })
//            .attr("transform", function(d) { return d < 360 && d > 180 ? "rotate(180 {},0)".format(radius+6) : null; })
            .text(function(d) { return d + "°"; });

        this.polarPlotAngular = polarPlotAngular ;
        this.polarPlotRadial = polarPlotRadial ;
        this.outerCircle = extendGroup.append('circle')
            .style("stroke", "rgba(0,0,0,0.4")
            .style('fill', 'none')
            .attr('r', radius)
    }

    this.hide = function(transitionTime){
        this.polarPlotAngular
            .transition()
            .duration(transitionTime)
            .style('opacity',0.0)
        this.polarPlotRadial
            .transition()
            .duration(transitionTime)
            .style('opacity',0.0)
        this.outerCircle
            .transition()
            .duration(transitionTime)
            .style('opacity', 0.0)
    }

    this.show = function(transitionTime){
        this.polarPlotAngular
            .transition()
            .duration(transitionTime)
            .style('opacity',1.0)
        this.polarPlotRadial
            .transition()
            .duration(transitionTime)
            .style('opacity',1.0)
        this.outerCircle
            .transition()
            .duration(transitionTime)
            .style('opacity', 1.0)
    }
    this.setup() ;

}