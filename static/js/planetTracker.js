function PlanetTracker(pos, dataInit, bindElement, rad, width, height) {

    this.pos = pos ;
    this.planetData = dataInit;
    this.bindElement = bindElement ;
    this.toolTipDiv = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0.0);
                            // .attr('transform', 'translate({}, {})'.format(width, height))
    this.toolTipInitX = parseFloat(this.toolTipDiv.style('left'));
    this.toolTipInitY = parseFloat(this.toolTipDiv.style('top'));
    console.log("Initial tool tip position: {}, {}".format(this.toolTipInitX, this.toolTipInitY));
    this.rad = rad ;
    this.width = width ;
    this.height = height ;

    this.black = "rgba(0,0,0,{})" ;
    this.hoverTransition = 300 ;
    this.planetHovering = false ;

    this.toDegree = function(radian){
        return (180.*radian)/(Math.PI)
    }

    this.createPlanetCircles = function(){
        var self = this;
        console.log("PlanetTracker.createPlanetCircles: Called.")
        console.log("PlanetTracker.createPlanetCircles: First element of this.planetData: {}, ({}, {})".format(
            this.planetData[0].name,
            this.planetData[0].sameDayPos[0].cx,
            this.planetData[0].sameDayPos[0].cy
        ));

        var circleGroup = this.bindElement.selectAll('circle').data(this.planetData) ;
        circleGroup.enter().append('circle')
            .attr('cx', function(d){return d.sameDayPos[0].cx})
            .attr('cy', function(d){return d.sameDayPos[0].cy})
            .attr('class', function(d){return d.name})
            .attr('r', function(d){return parseFloat(d.r)})
            .attr('stroke', "rgba(0,0,0,0.2)")
            .attr('stroke-width', function(d){return d.strokeWidth})
            .style("fill", function(d){return d.planetColor})
            .on("mouseover", this.mouseOverCallback(self))
            .on("mouseout", this.mouseOutCallback(self))
    }

    this.createPlanetSameDayPaths = function(){

        var planetDataLineGenerator = d3.line()
                        .x(function(d){return d.cx})
                        .y(function(d){return d.cy}) ;

        console.log("createPlanetSameDayPaths: Called.")
        var pathGroup = bindElement.selectAll('path').data(this.planetData) ;
        pathGroup.enter().append("path")
            .style("stroke", this.black.format(0.0))
            .style("stroke-width", 2)
            .attr("fill", "none")
            .attr("d",function(d){return planetDataLineGenerator(d.sameDayPos)})
    }


    this.createPlanetSameTimePaths = function(){


    }

    this.updatePlanetSameTimePaths = function(){


    }

    this.setup = function(){
        var self = this;
        this.updatePlanetData(self)(this.planetData);
        this.createPlanetCircles();
        // this.createPlanetSameDayPaths();
        // this.createPlanetSameTimePaths();
    }


    // Callbacks
    this.updatePlanetCircles = function(self){
        return function(){
    //        console.log("PlanetTracker.updatePlanetCircles: Called. this.planetData: {}".format(that.planetData[0].sameDayPos[0].cx))
            var circleGroup = self.bindElement.selectAll('circle').data(self.planetData) ;
            circleGroup.exit().remove();
            circleGroup.merge(circleGroup)
                .attr('cx', function(d){return d.sameDayPos[0].cx})
                .attr('cy', function(d){return d.sameDayPos[0].cy})
                .attr('class', function(d){return d.name})
                .attr('r', function(d){return parseFloat(d.r)})
                .attr('stroke', "rgba(0,0,0,0.2)")
                .attr('stroke-width', function(d){return d.strokeWidth})
                .style("fill", function(d){return d.planetColor})
                .on("mouseover", self.mouseOverCallback(self))
                .on("mouseout", self.mouseOutCallback(self));
    //        console.log(circleGroup);
        }
    }

    this.updatePlanetSameDayPaths = function(self){
        return function(){

            var planetDataLineGenerator = d3.line()
                            .x(function(d){return d.cx})
                            .y(function(d){return d.cy}) ;

            if (! that.planetHovering){
                var pathGroup = bindElement.selectAll('path').data(that.planetData) ;
                pathGroup.exit().remove();
                pathGroup.merge(pathGroup)
                    .style("stroke", that.black.format(0.0))
                    .style("stroke-width", 2)
                    .attr("fill", "none")
                    .attr("d",function(d){return planetDataLineGenerator(d.sameDayPos)})
            }
        }
    }

    this.update = function(self){
        return function(){
        //    console.log("PlanetTracker.update: Called.")
        //    console.log("PlanetTracker.update: Position: {}".format(self.pos));
            util.requestData("/get_planets", self.pos,
                        [self.updatePlanetData(self),
                        self.updatePlanetCircles(self)]);
                        // self.updatePlanetSameDayPaths(self),
                        // self.updatePlanetSameTimePaths(self)]);
        };
    }

    this.updatePlanetData = function(self){
        return function(data){
    //        console.log("updatePlanetData: Called") ;
            var planetColor ;
            var strokeWidth ;
            self.planetData = data ;
            self.planetData.forEach(function(d, i ){
                d.r = d.size * parseInt((rad)/ 25., 10);
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
        };
//        console.log("updatePlanetData: First planet name, cx and cy: {} {} {}"
//            .format(this.planetData[0].name, this.planetData[0].sameDayPos[0].cx, this.planetData[0].sameDayPos[0].cy))
    }

    this.mouseOverCallback = function(self){
        return function(d, i){
            self.planetHovering = true ;
            self.toolTipDiv.transition()
                .duration(self.hoverTransition)
                .style("opacity", .9);

            var divWidth = parseInt(self.toolTipDiv.style('width'), 10);
            var divHeight = parseInt(self.toolTipDiv.style('max-height'), 10);
        //    var divPadding = parseInt(self.toolTipDiv.style('padding'), 10);
            var divPadding = 10 ;
            var divX = parseFloat(parseFloat(d.sameDayPos[0].cx) + self.width/2 - divWidth/2 - divPadding/2, 10);
            var divY = parseFloat(parseFloat(d.sameDayPos[0].cy) - self.height/2 - divHeight - d.r - divPadding, 10);
            // console.log("planetTracker.mouseOverCallback: Calculated Position: {}, {}".format(divX, divY));
            self.toolTipDiv.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg;".format(
                                d.name,
                                self.toDegree(d.sameDayPos[0].az),
                                self.toDegree(d.sameDayPos[0].alt)))
                .style("transform","translate({}px,{}px)".format(divX.toFixed(1),divY.toFixed(1)))
                .style("background", "rgba(100,100,100,0.2)") ;

            // console.log("translate({}px,{}px)".format(divX.toFixed(1),-divY.toFixed(1)))
            var toolTipX = parseFloat(self.toolTipDiv.style('left'));
            var toolTipY = parseFloat(self.toolTipDiv.style('top'));
            // console.log("planetTracker.mouseOverCallback: Actual position {}, {}".format(toolTipX, toolTipY));
            d3.select(this)
                .transition()
                .duration(self.hoverTransition)
        //        .style('fill', black.format(0.2))
                .attr('stroke-width', 2)

            d3.select(this.parentNode).selectAll('path')
                .transition()
                .duration(self.hoverTransition)
                .style("stroke", function(di, ind){
                                    if (ind == i){
                                        return self.black.format(0.2)
                                    } else
                                        return self.black.format(0.0)
                 })

        //    var futurePlanetGroup = document.querySelector('#future{}'.format(i));
        //    var circleNodes = futurePlanetGroup.getElementsByTagName('circle');
        //    d3.selectAll(circleNodes)
        //        .transition()
        //        .duration(hoverTransition)
        //        .style('fill', black.format(0.2))
        }
    }

    this.mouseOutCallback = function(self){

        return function(d, i){

            self.planetHovering = false ;

            self.toolTipDiv.transition()
                .duration(self.hoverTransition)
                .style("opacity", 0);

            d3.select(this)
                .transition()
                .duration(self.hoverTransition)
        //        .style('fill', d.planetColor)
                .attr('stroke-width', d.strokeWidth);
            d3.select(this.parentNode).selectAll('path')
                .transition()
                .duration(self.hoverTransition)
                .style("stroke", function(di, ind){return self.black.format(0.0)});
        }

    //    var futurePlanetGroup = document.querySelector('#future{}'.format(i));
    //    var circleNodes = futurePlanetGroup.getElementsByTagName('circle');
    //    d3.selectAll(circleNodes)
    //        .transition()
    //        .duration(hoverTransition)
    //        .style('fill', black.format(0.0))
    }
}
