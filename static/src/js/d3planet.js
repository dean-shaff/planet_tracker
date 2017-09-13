function D3Planet(parent, bindElement, data){

    this.parent = parent
    this.planetHovering = false ;
    this.clicked = false ;
    this.bindElement = bindElement ;
    this.planetGroup = bindElement.append('g');
    if (data){
        this.data = data ;
        this.planetColor = this.data.planetColor;
        this.name = this.data.name
    } else {
        this.data = null ;
        this.planetColor = null ;
        this.name = "";
    }
    this.planetCircle = null;
    this.sameTimeCircles = null ;
    this.sameDayPath = null ;
    this.planetToolTip = d3.select(this.parent.plotBindElement).append("div")
                            .attr("class", "tooltip")
                            .style("opacity",0)

    this.planetDataLineGenerator = d3.line()
                                    .x(function(d){return d.cx})
                                    .y(function(d){return d.cy})

    this.setup = function(){
        this.planetCircle = this.setPlanetCircleAttributes(this.planetGroup.append("circle"));
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
            self.setPlanetCircleAttributes(self.planetCircle)
        };
    }

    this.mouseClick = function(self){
        return function(){
            self.clicked = ! self.clicked ;
            if (self.clicked){
                self.mouseOverCallback(self).bind(this)()
            } else {
                self.mouseOutCallback(self).bind(this)()
            }
        }
    }

    this.mouseOverCallback = function(self){
        return function(){
            self.parent.logger.debug("mouseOverCallback: Called.")
            self.parent.logger.debug(`mouseOverCallback: ${this}`);
            self.planetHovering = true ;
            self.planetToolTip.transition()
                .duration(self.parent.hoverTransition)
                .style("opacity", .9)
                // .style("width", "70px")
            self.planetToolTip.moveToFront()

            var divWidth = parseInt(self.planetToolTip.style('width'), 10);
            var divHeight = parseInt(self.planetToolTip.style('max-height'), 10);
            var parentDivWidth = $(self.parent.plotBindElement).width();
            var parentDivHeight = $(self.parent.plotBindElement).height();
            var divPadding = 10 ;

            // var polarPlotTransform = d3.select("#polar-plot g").attr("transform");

            // var divX = parseFloat(self.data.sameDayPos[0].cx + self.parent.polarPlotTransform.x , 10) ;
            // var divY = parseFloat(self.data.sameDayPos[0].cy + self.parent.polarPlotTransform.y, 10) ;

            var divX = parseFloat(parseFloat(self.data.sameDayPos[0].cx) + parentDivWidth/2 - divWidth/2 - divPadding/2, 10);
            var divY = parseFloat(parseFloat(self.data.sameDayPos[0].cy) - parentDivHeight + self.parent.rad - divHeight - self.data.r, 10);

            self.parent.logger.debug(`mouseOverCallback: width: ${self.parent.width}, height: ${self.parent.height}`)
            self.parent.logger.debug(`mouseOverCallback: width: ${parentDivWidth}, height: ${parentDivHeight}, rad: ${self.parent.rad}`)
            self.parent.logger.debug("mouseOverCallback: Calculated Position: {}, {}".format(divX, divY));
            self.planetToolTip.html("<b>{}</b><br/>{:.4f}&deg; {:.4f}&deg<br/>{}".format(
                                self.data.name,
                                util.toDegree(self.data.sameDayPos[0].az),
                                util.toDegree(self.data.sameDayPos[0].alt),
                                self.data.setting_time))
                .style("transform","translate({}px,{}px)".format(divX.toFixed(1),divY.toFixed(1)))
                .style("background", "rgba(100,100,100,0.2)") ;

            self.parent.logger.debug("mouseOverCallback: translate({}px,{}px)".format(divX.toFixed(1),-divY.toFixed(1)))
            var toolTipX = parseFloat(self.planetToolTip.style('left'));
            var toolTipY = parseFloat(self.planetToolTip.style('top'));
            self.parent.logger.debug("mouseOverCallback: Actual position {}, {}".format(toolTipX, toolTipY));
            self.planetCircle
                .transition()
                .duration(self.parent.hoverTransition)
                .attr('stroke-width', 2)
        }
    }


    this.mouseOutCallback = function(self){

        return function(){
            self.parent.logger.debug("mouseOutCallback: Called.")
            var time = performance.now();
            self.planetHovering = false ;

            self.planetToolTip.transition()
                .duration(self.hoverTransition)
                .style("opacity", 0)
                // .style("width", 0)
            self.planetToolTip.moveToBack()

            self.planetCircle
                .transition()
                .duration(self.parent.hoverTransition)
                .attr('stroke-width', self.data.strokeWidth);

            self.parent.logger.debug("Took {:.2f} seconds".format(performance.now() - time))
        }
    };

    this.setPlanetCircleAttributes = function(planetCircle){
        planetCircle
            .attr('cx',this.data.sameDayPos[0].cx)
            .attr('cy',this.data.sameDayPos[0].cy)
            .attr('r', this.data.r)
            .style('fill',this.data.planetColor)
            .attr('stroke', "rgba(0,0,0,0.2)")
            .attr('stroke-width',this.data.strokeWidth)
        if (! this.parent.mobile) {
            planetCircle
                .on('mouseover', this.mouseOverCallback(this))
                .on('mouseout', this.mouseOutCallback(this))
        } else {
            planetCircle.on('click', this.mouseClick(this));
        }
        return planetCircle;
    }
}
