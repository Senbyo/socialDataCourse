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


// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("processed_men.csv", function(error, data) {
	d3.csv("processed_women.csv", function(error2, data2) {
  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.Year = +d.Year;
    d.Time = +d.Time;
    //console.log(d);
  });

	data2.forEach(function(d) {
    d.Year = +d.Year;
    d.Time = +d.Time;
    //console.log(d);
  });


  // don't want dots overlapping axis, so add in buffer to data domain

  xScale.domain([d3.min(data,  xValue)-1, d3.max(data,xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data2,yValue)+1]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
 //x axis labels
    svg.append("text")
    .attr("transform",
          "translate(" + (width/2) + " ," +
                         (height + margin.top) + ")")
    .style("text-anchor", "middle")
    .text("Year");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

      // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Time (minutes)");


  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
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


			svg.selectAll()
				.data(data2)
				.enter().append("rect")
					.attr("class", "dot")
          .attr("x", xMap)         // position the left of the rectangle
          .attr("y", yMap)          // position the top of the rectangle
          .attr("height", 6)    // set the height
          .attr("width", 6)    // set the width
          .attr("rx", 2)         // set the x corner curve radius
          .attr("ry", 1)       // set the y corner curve radius
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

           var lineFunction = d3.line()
                         .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; });


           var legendRectSize = 18;                                  // NEW
           var legendSpacing = 4;                                    // NEW


           // draw legend for men
           var legend = svg.selectAll('.legend')                     // NEW
                 .data(color.domain())                                   // NEW
                 .enter()                                                // NEW
                 .append('g')                                            // NEW
                 .attr('class', 'legend')                                // NEW
                 .attr('transform', function(d, i) {                     // NEW
                   var height = legendRectSize + legendSpacing;          // NEW
                   var offset =  height * color.domain().length / 2;     // NEW
                   var horz = 25 * legendRectSize;                       // NEW
                   var vert = i * height - offset;                       // NEW
                   return 'translate(' + horz + ',' + vert + ')';        // NEW
                 });                                                     // NEW


               legend.append('rect')                                     // NEW
                 .attr('width', legendRectSize)                          // NEW
                 .attr('height', legendRectSize)                         // NEW
                 .style('fill', color)                                   // NEW
                 .style('stroke', color);                                // NEW

               legend.append('text')                                     // NEW
                 .attr('x', legendRectSize + legendSpacing)              // NEW
                 .attr('y', legendRectSize - legendSpacing)              // NEW
                 .text(function(d) { return d; });                       // NEW
                                                      // NEW


//TODO:
////////LINES.. NOT WORKING RIGHT NOW ///////////////////

//line slope and intercept
          var aMen = -0.29;
          var bMen = 709.71;

          var aWomen=-0.93;
          var bWomen=2018.72;

          var lineData = [ { "x": 1900,   "y":aMen * 1900 +bMen },  { "x": 2013,  "y": aMen * 2013 +bMen}];
          // define the line
          var valueline = d3.line()
              .x(function(d) { return d.x; })
              .y(function(d) { return d.y; });
//aMen * 1900 +bMen
//aMen * 2013 +bMen

    //  svg.append("line")          // attach a line
  //    .style("stroke", "black")  // colour the line
  //  .attr("x1", 100)     // x position of the first end of the line
  //    .attr("y1", 100)      // y position of the first end of the line
  //    .attr("x2", 200)     // x position of the second end of the line
  //    .attr("y2", 200);    // y position of the second end of the line

      // Add the valueline path.
      svg.append("path")
            .data(lineData)
            .attr("class", "line")
            .attr("d", valueline);

})});
