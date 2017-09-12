function D3Planet(parent, bindElement, data){

    this.parent = parent
    this.planetHovering = false ;
    this.bindElement = bindElement ;
    this.planetGroup = bindElement.append('g');
    if (data){
        this.data = data ;
        this.planetColor = this.data.planetColor;
    } else {
        this.data = null ;
        this.planetColor = null ;
    }
    this.planetCircle = null;
    this.sameTimeCircles = null ;
    this.sameDayPath = null ;
    this.planetToolTip = d3.select(this.parent.bindElement).append("div")
                            .attr("class", "tooltip")
                            .style("opacity",0)

    this.planetDataLineGenerator = d3.line()
                                    .x(function(d){return d.cx})
                                    .y(function(d){return d.cy})

    this.setup = function(){
        // Create the sameTimeCircles (the position of the planet at the same time on future days)
        // var circleGroup = this.bindElement.selectAll('circle').data(this.data.sameTimePos)
        // this.sameTimeCircles = circleGroup.enter().append('circle')
        //     .attr('cx', function(d){return d.cx})
        //     .attr('cy', function(d){return d.cy})
        //     .attr('r', function(d){return 0.3*d.r})
        //     .style('fill', this.parent.black.format(0.0))

        // Create the sameDayPath (the postion of the planet before sunrise)
        // this.sameDayPath = this.bindElement.append('path')
        //     .style('stroke', this.parent.black.format(0.0))
        //     .style('stroke-width',2)
        //     .attr('fill',"none")
        //     .attr('d', this.planetDataLineGenerator(this.data.sameDayPos))

        // Create the planet circle
        if (this.data){
            this.planetCircle = this.planetGroup.append("circle")
                .attr('cx',this.data.sameDayPos[0].cx)
                .attr('cy',this.data.sameDayPos[0].cy)
                .attr('r', this.data.r)
                .style('fill',this.data.planetColor)
                .attr('stroke', "rgba(0,0,0,0.2)")
                .attr('stroke-width',this.data.strokeWidth)
                .on('mouseover', this.mouseOverCallback(this))
                .on('mouseout', this.mouseOutCallback(this))
        } else {
            this.planetCircle = this.planetGroup.append("circle")
                .attr('cx',0.0)
                .attr('cy',0.0)
                .attr('r', 0.0)
                .style('fill',"rgba(0,0,0)")
                .attr('stroke', "rgba(0,0,0,0.2)")
                .attr('stroke-width',0.0)
        }

    }

    this.update = function(self){
        return function(data){
            self.data = data ;
            var opacity = 0.0
            var planetStrokeWidth = 0.0;
            if (self.planetHovering){
                opacity = 0.2;
                planetStrokeWidth = 2.0;
            }else{
                planetStrokeWidth = self.data.strokeWidth;
            }

            // Update the sameTimeCircles (the position of the planet at the same time on future days)
            var circleGroup = self.bindElement.selectAll('circle').data(self.data.sameTimePos)
            circleGroup.exit().remove();
            circleGroup.merge(circleGroup)
                .attr('cx', function(d){return d.cx})
                .attr('cy', function(d){return d.cy})
                .attr('r', function(d){return 0.3*d.r})
                .style('fill',self.parent.black.format(opacity));

            self.planetCircle
                .attr('cx',self.data.sameDayPos[0].cx)
                .attr('cy',self.data.sameDayPos[0].cy)
                .attr('r', self.data.r)
                .style('fill',self.data.planetColor)
                .style('opacity',1.0)
                .attr('stroke', self.parent.black.format(0.2))
                .attr('stroke-width',planetStrokeWidth)
                .on('mouseover', self.mouseOverCallback(self))
                .on('mouseout', self.mouseOutCallback(self));

            // self.sameDayPath
            //     .style('stroke', self.parent.black.format(strokeAlpha))
            //     .style('stroke-width',2)
            //     .attr('fill',"none")
            //     .attr('d', self.planetDataLineGenerator(self.data.sameDayPos))
        };
    }

    this.mouseOverCallback = function(self){
        return function(){
            self.parent.logger.debug("mouseOverCallback: Called.")
            self.planetHovering = true ;
            self.planetToolTip.transition()
                .duration(self.parent.hoverTransition)
                .style("opacity", .9);

            var divWidth = parseInt(self.planetToolTip.style('width'), 10);
            var divHeight = parseInt(self.planetToolTip.style('max-height'), 10);
            var parentDivWidth = $(self.parent.bindElement).width();
            var parentDivHeight = $(self.parent.bindElement).height();
            var divPadding = 10 ;
            var divX = parseFloat(parseFloat(self.data.sameDayPos[0].cx) + parentDivWidth/2 - divWidth/2 - divPadding/2, 10);
            var divY = parseFloat(parseFloat(self.data.sameDayPos[0].cy) - parentDivHeight/2 - divHeight - self.data.r - divPadding*2, 10);
            self.parent.logger.debug(`mouseOverCallback: width: ${self.parent.width}, height: ${self.parent.height}`)
            self.parent.logger.debug(`mouseOverCallback: width: ${parentDivWidth}, height: ${parentDivHeight}`)
            self.parent.logger.debug("mouseOverCallback: Calculated Position: {}, {}".format(divX, divY));
            self.planetToolTip.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg<br/>{}".format(
                                self.data.name,
                                util.toDegree(self.data.sameDayPos[0].az),
                                util.toDegree(self.data.sameDayPos[0].alt),
                                self.data.setting_time))
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

            // self.sameTimeCircles
            //     .transition()
            //     .duration(self.parent.hoverTransition)
            //     .style('fill', self.parent.black.format(0.2))
                // .style('opacity',0.2)
            // self.sameDayPath
            //     .transition()
            //     .duration(self.parent.hoverTransition)
            //     .style('stroke', self.parent.black.format(0.2))

        }
    }


    this.mouseOutCallback = function(self){

        return function(){
            self.parent.logger.debug("mouseOutCallback: Called.")
            var time = performance.now();
            self.planetHovering = false ;

            self.planetToolTip.transition()
                .duration(self.hoverTransition)
                .style("opacity", 0);

            d3.select(this)
                .transition()
                .duration(self.parent.hoverTransition)
        //        .style('fill', self.data.planetColor)
                .attr('stroke-width', self.data.strokeWidth);

            // self.sameTimeCircles
            //     .transition()
            //     .duration(self.parent.hoverTransition)
            //     .style('fill', self.parent.black.format(0.0))
            // self.sameDayPath
            //     .transition()
            //     .duration(self.parent.hoverTransition)
            //     .style('stroke', self.parent.black.format(0.0))

            self.parent.logger.debug("Took {:.2f} seconds".format(performance.now() - time))
            // d3.select(this.parentNode).selectAll('path')
            //     .transition()
            //     .duration(self.hoverTransition)
            //     .style("stroke", function(di, ind){return self.black.format(0.0)});
        }
    }

}
