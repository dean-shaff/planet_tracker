function D3Planet(parent, bindElement, data){

    this.parent = parent
    this.bindElement = bindElement ;
    this.planetGroup = bindElement.append('g');
    this.data = data ;
    this.planetCircle = null;
    this.sameTimeCircles = null ;
    this.sameDayPath = null ;
    this.planetToolTip = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("opacity",1.0)

    this.planetDataLineGenerator = d3.line()
                                    .x(function(d){return d.cx})
                                    .y(function(d){return d.cy})

    this.setup = function(){
        // Create the sameTimeCircles (the position of the planet at the same time on future days)
        var circleGroup = this.bindElement.selectAll('circle').data(this.data.sameTimePos)
        circleGroup.enter().append('circle')
            .attr('cx', function(d){return d.cx})
            .attr('cy', function(d){return d.cy})
            .attr('r', function(d){return 0.2*d.r})
            .style('fill', "rgba(0,0,0,0.1)")
        // Create the sameDayPath (the postion of the planet before sunrise)
        this.sameDayPath = this.bindElement.append('path')
            .style('stroke', this.parent.black.format(0.0))
            .style('stroke-width',2)
            .attr('fill',"none")
            .attr('d', this.planetDataLineGenerator(this.data.sameDayPos))
            // .on('mouseover', this.mouseOverCallback(this))
            // .on('mouseout', this.mouseOutCallback(this))
        // Create the planet circle
        this.planetCircle = this.planetGroup.append("circle")
            .attr('cx',this.data.sameDayPos[0].cx)
            .attr('cy',this.data.sameDayPos[0].cy)
            .attr('r', this.data.r)
            .style('fill',this.data.planetColor)
            .attr('stroke', "rgba(0,0,0,0.2)")
            .attr('stroke-width',this.data.strokeWidth)
            .on('mouseover', this.mouseOverCallback(this))
            .on('mouseout', this.mouseOutCallback(this))

    }

    this.update = function(self){
        return function(data){
            self.data = data ;
            // Update the sameTimeCircles (the position of the planet at the same time on future days)
            var circleGroup = self.bindElement.selectAll('circle').data(self.data.sameTimePos)
            circleGroup.exit().remove();
            circleGroup.merge(circleGroup)
                .attr('cx', function(d){return d.cx})
                .attr('cy', function(d){return d.cy})
                .attr('r', function(d){return 0.2*d.r})
                .style('fill', "rgba(0,0,0,0.1)")

            self.planetCircle
                .attr('cx',self.data.sameDayPos[0].cx)
                .attr('cy',self.data.sameDayPos[0].cy)
                .attr('r', self.data.r)
                .style('fill',self.data.planetColor)
                .attr('stroke', "rgba(0,0,0,0.2)")
                .attr('stroke-width',self.data.strokeWidth)
                .on('mouseover', self.mouseOverCallback(self))
                .on('mouseout', self.mouseOutCallback(self))

            self.sameDayPath
                .style('stroke', self.parent.black.format(0.0))
                .style('stroke-width',2)
                .attr('fill',"none")
                .attr('d', self.planetDataLineGenerator(self.data.sameDayPos))
        };
    }

    this.mouseOverCallback = function(self){
        return function(){
            self.parent.planetHovering = true ;
            self.planetToolTip.transition()
                .duration(self.parent.hoverTransition)
                .style("opacity", .9);

            var divWidth = parseInt(self.planetToolTip.style('width'), 10);
            var divHeight = parseInt(self.planetToolTip.style('max-height'), 10);
            var divPadding = 10 ;
            var divX = parseFloat(parseFloat(self.data.sameDayPos[0].cx) + self.parent.width/2 - divWidth/2 - divPadding/2, 10);
            var divY = parseFloat(parseFloat(self.data.sameDayPos[0].cy) - self.parent.height/2 - divHeight - self.data.r - divPadding, 10);
            self.parent.logger.debug1("planetTracker.mouseOverCallback: Calculated Position: {}, {}".format(divX, divY));
            self.planetToolTip.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg;".format(
                                self.data.name,
                                self.parent.toDegree(self.data.sameDayPos[0].az),
                                self.parent.toDegree(self.data.sameDayPos[0].alt)))
                .style("transform","translate({}px,{}px)".format(divX.toFixed(1),divY.toFixed(1)))
                .style("background", "rgba(100,100,100,0.2)") ;

            self.parent.logger.debug1("translate({}px,{}px)".format(divX.toFixed(1),-divY.toFixed(1)))
            var toolTipX = parseFloat(self.planetToolTip.style('left'));
            var toolTipY = parseFloat(self.planetToolTip.style('top'));
            self.parent.logger.debug1("planetTracker.mouseOverCallback: Actual position {}, {}".format(toolTipX, toolTipY));
            // This transitions the actual planet Circle.
            d3.select(this)
                .transition()
                .duration(self.parent.hoverTransition)
                .attr('stroke-width', 2)

            self.sameDayPath
                .transition()
                .duration(self.parent.hoverTransition)
                .style('stroke', self.parent.black.format(0.2))

            // d3.select(this.parentNode).selectAll('path')
            //     .transition()
            //     .duration(self.parent.hoverTransition)
            //     .style("stroke", function(di, ind){
            //                         if (ind == i){
            //                             return self.parent.black.format(0.2)
            //                         } else
            //                             return self.parent.black.format(0.0)
            //      })

        }
    }


    this.mouseOutCallback = function(self){

        return function(){
            self.parent.logger.debug("mouseOutCallback: Called.")
            var time = performance.now();
            self.parent.planetHovering = false ;

            self.planetToolTip.transition()
                .duration(self.hoverTransition)
                .style("opacity", 0);

            d3.select(this)
                .transition()
                .duration(self.parent.hoverTransition)
        //        .style('fill', self.data.planetColor)
                .attr('stroke-width', self.data.strokeWidth);

            self.sameDayPath
                .transition()
                .duration(self.parent.hoverTransition)
                .style('stroke', self.parent.black.format(0.0))
                
            self.parent.logger.debug("Took {:.2f} seconds".format(performance.now() - time))
            // d3.select(this.parentNode).selectAll('path')
            //     .transition()
            //     .duration(self.hoverTransition)
            //     .style("stroke", function(di, ind){return self.black.format(0.0)});
        }
    }

}
