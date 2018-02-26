var margin = {top: 50, right: 100, bottom: 100, left: 60},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

/*
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x
var xValue = function(d) { return d.Year;}, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.axisBottom(xScale);

// setup y
var yValue = function(d) { return d.Time;}, // data -> value
    yScale = d3.scaleLinear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.axisLeft(yScale);

// setup fill color
var cValue = function(d) { return d;},
    color = d3.scaleOrdinal(d3.schemeCategory10);

var formatTime = d3.timeFormat("%Y");

// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

var rowConverter = function(d) {
     return {
          Year: parseInt(d.Year),
          Time: parseInt(d.Time)
     }
}


var menCircle;
var womenCircle;
var menLine;
var womenLine;
var womenRegressionLine;

var data;
var data2;

// load data
d3.csv("processed_men.csv", rowConverter, function(error, dataMen) {

     if (error) {
     	console.log(error);
     } else {
     	data = dataMen;
     }

     d3.csv("processed_women.csv", rowConverter, function(error2, dataWomen) {

          if (error) {
     		console.log(error);
     	} else {
     		data2 = dataWomen;
          }

          // don't want dots overlapping axis, so add in buffer to data domain
          xScale.domain([d3.min(data,  xValue)-1, d3.max(data,xValue)+1]);
          yScale.domain([d3.min(data, yValue)-1, d3.max(data2,yValue)+1]);

          doAxis()

          // text label for the y axis
          svg.append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 0 - margin.left)
               .attr("x",0 - (height / 2))
               .attr("dy", "1em")
               .style("text-anchor", "middle")
               .text("Time (minutes)");
          drawDots()

          drawPath()

          drawLinearLine()

          drawLegend()

     })
});

function doAxis(){
  xAxis = d3.axisBottom()
       .scale(xScale)
       .ticks(10)
       .tickFormat(d3.nice);

  svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + (height) + ")")
       .call(xAxis);

  svg.append("text")
       .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top) + ")")
       .style("text-anchor", "middle")
       .text("Year");

  // y-axis
  svg.append("g")
       .attr("class", "y axis")
       .call(yAxis);
}
//men
function loadMen(){
  //d3.selectAll(".dot").remove();
  //d3.selectAll("path").remove();

  womenCircle.transition()
      .attr("height", 0)       // Set the height
      .attr("width", 0);  

  womenLine.transition()
      .duration(500)
      .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
      .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });

  womenRegressionLine.transition()
    .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });

  drawDotsMenOnly()
  drawPathMen()

  menRegressionLine.transition()
    .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
    .transition()
    .delay(1000)
    .attr("stroke-dashoffset", function(d){ return 0 });

}

var drawDotsMenOnly = function() {
     // Draw dots for men.
      menCircle.transition()
          .attr("r", 0)
          .attr("cx", xMap)
          .attr("cy", yMap)
         .transition()
         .ease(d3.easeExpIn)
         .delay(function(d, i){
          return 500 + i * 20;
         })
         .attr("r", 3.5);

}
var drawLinearLineMen = function() {

    var aMen = -0.29;
    var bMen = 709.71;

    regressionLine = d3.line()
          .x(function(d) {
               return xScale(d.Year)
          })
          .y(function(d) {
               return yScale(aMen * d.Year + bMen)
          });

    var menRegressionGroup = svg.append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "womenRegression");

    menRegressionLine = menRegressionGroup.append("path")
          .datum(data)
          .attr("class", "line men")
          .attr("d", regressionLine);

}
var drawPathMen = function() {

    menLine.transition()
        .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
        .transition()
        .delay(10)
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

}



//women
function loadWomen(){

  menCircle.transition()
    .duration(500)
    .attr("r", 0);

  menLine.transition()
      .duration(500)
      .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });

  drawDotsWomenOnly()
  //drawLinearLineWomen()

  womenRegressionLine.transition()
      .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
      .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
      .transition()
      .delay(1000)
      .attr("stroke-dashoffset", function(d){ return 0 });

  drawPathWomen()

  menRegressionLine.transition()
    .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
    .attr("stroke-dashoffset", function(d){ return this.getTotalLength() });
}
var drawPathWomen = function() {


    womenLine.transition()
        .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
        .attr("stroke-dashoffset", function(d){ return this.getTotalLength() })
        .transition()
        .delay(10)
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    /*
     line = d3.line()
                    .x(function(d) { return xScale(d.Year); })
                    .y(function(d) { return yScale(d.Time); });

     svg.append("path")
          .datum(data2)
          .attr("class", "line women")
          .attr("d", line);

    */
}
var drawDotsWomenOnly = function() {

    womenCircle.transition()
        .attr("height", 0)       // Set the height
        .attr("width", 0)   
       .transition()
       .ease(d3.easeExpIn)
       .delay(function(d, i){
        return 500 + i * 20;
       })
        .attr("height", 6)       // Set the height
        .attr("width", 6)   
    }
var drawLinearLineWomen = function() {

     var aWomen=-0.93;
     var bWomen=2018.72;

     regressionLine = d3.line()
          .x(function(d) {
               return xScale(d.Year)
          })
          .y(function(d) {
               return yScale(aWomen * d.Year + bWomen)
          });

   var womenRegressionGroup = svg.append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "womenRegression");


   womenRegressionLine = womenRegressionGroup.append("path")
          .datum(data2)
          .attr("class", "line women")
          .attr("d", regressionLine)
          .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
          .attr("stroke-dashoffset", function(d){ return 0 });

    }


//all
function loadBoth(){
  //d3.selectAll(".dot").remove();
  //d3.selectAll("path").remove();

  drawDots()
  drawPath()
  drawLinearLine()
  //drawLinearLine()
  drawLegend()
  doAxis()
}
var drawPath = function() {

     line = d3.line()
                    .x(function(d) { return xScale(d.Year); })
                    .y(function(d) { return yScale(d.Time); });

     //Create lines

   var menLineGroup = svg.append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "menLine");

    menLine = menLineGroup.append("path")
          .datum(data)
          .attr("class", "line men")
          .attr("d", line)
          .attr("stroke-dasharray", function(d){ return this.getTotalLength() })
          .attr("stroke-dashoffset", function(d){ return 0 });

   var womenLineGroup = svg.append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "womenLine");

    womenLine = womenLineGroup.append("path")
          .datum(data2)
          .attr("class", "line women")
          .attr("d", line);
}
var drawLinearLine = function() {

     drawLinearLineMen()

     drawLinearLineWomen()

}
var drawDots = function() {
     // Draw dots for men.

  var menGroup = svg.append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "men");

   menCircle = menGroup.selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("r", 3.5)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .style("fill", function(d) { return color(cValue("Men"));})
          .on("mouseover", function(d) {
               tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

               tooltip.html("("+d["Year"] + ","+d["Time"]+")" )
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");
         })
         .on("mouseout", function(d) {
             tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
         });

  var womenGroup = svg.append("g")
  .attr("x", 0)
  .attr("y", 0)
  .attr("class", "women");

     // Draw dots for women.


	womenCircle = womenGroup.selectAll("rect")
     	.data(data2)
     	.enter().append("rect")
          .attr("class", "dot")
          .attr("x", xMap)         // Position the left of the rectangle
          .attr("y", yMap)         // Position the top of the rectangle
          .attr("height", 6)       // Set the height
          .attr("width", 6)        // Set the width
          .attr("rx", 2)           // Set the x corner curve radius
          .attr("ry", 1)           // Set the y corner curve radius
		.style("fill", function(d) {  return color(cValue("Women"));})
		.on("mouseover", function(d) {
               tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);

               tooltip.html("("+d["Year"] + ","+d["Time"]+")" )
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 20) + "px");
          })
		.on("mouseout", function(d) {
               tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
		});



}
var drawLegend = function() {
   var lineFunction = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; });

    var legendRectSize = 18;
    var legendSpacing = 4;

    // Draw legend.
    var legend = svg.selectAll('.legend')
          .data(color.domain())
          .enter()
          .append('g')
          .attr('class', 'legend')
          .attr('transform', function(d, i) {
               var height = legendRectSize + legendSpacing;
               var offset =  height * color.domain().length / 2;
               var horz = 25 * legendRectSize;
               var vert = i * height - offset;
               return 'translate(' + horz + ',' + vert + ')';
          });

     legend.append('rect')
          .attr('width', legendRectSize)
          .attr('height', legendRectSize)
          .style('fill', color)
          .style('stroke', color);

     legend.append('text')
          .attr('x', legendRectSize + legendSpacing)
          .attr('y', legendRectSize - legendSpacing)
          .text(function(d) { return d; });
}
