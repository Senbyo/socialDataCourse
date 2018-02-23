var margin = {top: 50, right: 50, bottom: 60, left: 60},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Year");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Time(minutes)");

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
          tooltip.html(d["Year"] + "<br/> (" + xValue(d)
	        + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });


  // draw legend
  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });


			svg.selectAll()
				.data(data2)
				.enter().append("circle")
					.attr("class", "dot")
					.attr("r", 3.5)
					.attr("cx", xMap)
					.attr("cy", yMap)
					.style("fill", function(d) { return "red";})
					.on("mouseover", function(d) {
							tooltip.transition()
									 .duration(200)
									 .style("opacity", .9);
							tooltip.html(d["Year"] + "<br/> (" + xValue(d)
							+ ", " + yValue(d) + ")")
									 .style("left", (d3.event.pageX + 5) + "px")
									 .style("top", (d3.event.pageY - 28) + "px");
					})
					.on("mouseout", function(d) {
							tooltip.transition()
									 .duration(500)
									 .style("opacity", 0);
					});


})});
