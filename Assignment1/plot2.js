//Width and height
var margin = {top: 50, right: 100, bottom: 100, left: 60}
var w = 800;
var h = 300;
var padding = 40;

var dataset, xScale, yScale, xAxis, yAxis, line;

//For converting Dates to strings
var formatTime = d3.timeFormat("%Y");

//Function for converting CSV values from strings to Dates and numbers
var rowConverter = function(d) {
	return {
		year: new Date(+d.Year + 1, 0),  //Make a new Date object for each year + month
		time: parseInt(d.Time)  //Convert from string to float
	};
}

// Return the x value of a point.
var xValue = function(d) {
     return d.year;
}

// Return the y value of a point.
var yValue = function(d) {
     return d.time;
}

var xMap = function(d) {
     return xScale(xValue(d));
}
var yMap = function(d) {
     return yScale(yValue(d));
}

var tooltip = d3.select("body")
                    .append("#plot")
                    .attr("class", "tooltip");

//Load in data
d3.csv("processed_men.csv", rowConverter, function(error, data) {

     if (error) {
          console.log(error);
     }

	dataset = data;

	//Print data to console as table, for verification
	// console.table(dataset, ["year", "time"]);

     generateVisualization()
});


var generateVisualization = function() {
     //Create scale functions
     xScale = d3.scaleTime()
                       .domain([
                              d3.min(dataset, function(d) { return d.year; }),
                              d3.max(dataset, function(d) { return d.year; })
                         ])
                       .range([padding, w]);

     yScale = d3.scaleLinear()
                         .domain([
                              d3.min(dataset, function(d) { if (d.time >= 0) return d.time; }) - 10,
                              d3.max(dataset, function(d) { return d.time; })
                         ])
                         .range([h - padding, 0]);

     //Define axes
     xAxis = d3.axisBottom()
                  .scale(xScale)
                  .ticks(10)
                  .tickFormat(formatTime);

     //Define Y axis
     yAxis = d3.axisLeft()
                  .scale(yScale)
                  .ticks(10);

     //Define line generators
     line = d3.line()
                    .x(function(d) { return xScale(d.year); })
                    .y(function(d) { return yScale(d.time); });

     //Create SVG element
     var svg = d3.select("#plot")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);

     //Create lines
     svg.append("path")
          .datum(dataset)
          .attr("class", "line men")
          .attr("d", line);


     //Create axes
     svg.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + (h - padding) + ")")
          .call(xAxis);

     svg.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + padding + ",0)")
          .call(yAxis);

     drawDots(svg)
}

var drawDots = function(svg) {
     svg.selectAll(".dot")
          .data(dataset)
          .enter()
          .append("circle")
          .attr("class", "dot men")
          .attr("r", 3.5)
          .attr("cx", xMap)
          .attr("cy", yMap)
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
}



//
//
//
// var margin = {top: 50, right: 100, bottom: 100, left: 60},
//     width = 600 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;
//
// /*
//  * value accessor - returns the value to encode for a given data object.
//  * scale - maps value to a visual display encoding, such as a pixel position.
//  * map function - maps from data value to display value
//  * axis - sets up axis
//  */
//
// // setup x
// var xValue = function(d) { return d.Year;}, // data -> value
//     xScale = d3.scaleLinear().range([0, width]), // value -> display
//     xMap = function(d) { return xScale(xValue(d));}, // data -> display
//     xAxis = d3.axisBottom(xScale);
//
// // setup y
// var yValue = function(d) { return d.Time;}, // data -> value
//     yScale = d3.scaleLinear().range([height, 0]), // value -> display
//     yMap = function(d) { return yScale(yValue(d));}, // data -> display
//     yAxis = d3.axisLeft(yScale);
//
// // setup fill color
// var cValue = function(d) { return d;},
//     color = d3.scaleOrdinal(d3.schemeCategory10);
//
// // add the graph canvas to the body of the webpage
// var svg = d3.select("body").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
// // add the tooltip area to the webpage
// var tooltip = d3.select("body")
//                     .append("div")
//                     .attr("class", "tooltip");
//
// var rowConverter = function(d) {
//      return {
//           Year: parseInt(d.Year),
//           Time: parseInt(d.Time)
//      }
// }
//
// var data;
// var data2;
//
// // load data
// d3.csv("processed_men.csv", rowConverter, function(error, dataMen) {
//
//      if (error) {
// 		console.log(error);
// 	} else {
// 		data = dataMen;
//      }
//
// 	d3.csv("processed_women.csv", rowConverter, function(error2, dataWomen) {
//
//           if (error) {
//      		console.log(error);
//      	} else {
//      		data2 = dataWomen;
//           }
//
//        // don't want dots overlapping axis, so add in buffer to data domain
//        xScale.domain([d3.min(data,  xValue)-1, d3.max(data,xValue)+1]);
//        yScale.domain([d3.min(data, yValue)-1, d3.max(data2,yValue)+1]);
//
//        // x-axis
//        svg.append("g")
//            .attr("class", "x axis")
//            .attr("transform", "translate(0," + height + ")")
//            .call(xAxis);
//            //x axis labels
//           svg.append("text")
//                .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top) + ")")
//          .style("text-anchor", "middle")
//          .text("Year");
//
//        // y-axis
//        svg.append("g")
//            .attr("class", "y axis")
//            .call(yAxis);
//
//            // text label for the y axis
//        svg.append("text")
//            .attr("transform", "rotate(-90)")
//            .attr("y", 0 - margin.left)
//            .attr("x",0 - (height / 2))
//            .attr("dy", "1em")
//            .style("text-anchor", "middle")
//            .text("Time (minutes)");
//       drawDots()
//
//      drawPath()
//
//      //drawLinearLine()
//
//      drawLegend()
//
//      })
// });
//
// var drawPath = function() {
//
// }
//
// // var drawLinearLine = function() {
// //      //TODO:
// //      ////////LINES.. NOT WORKING RIGHT NOW ///////////////////
// //
// //      //line slope and intercept
// //                // var aMen = -0.29;
// //                // var bMen = 709.71;
// //                //
// //                // var aWomen=-0.93;
// //                // var bWomen=2018.72;
// //                //
// //                // var lineData = [ { "x": 1900,   "y":aMen * 1900 +bMen },  { "x": 2013,  "y": aMen * 2013 +bMen}];
// //                // // define the line
// //                var valueline = d3.line()
// //                    .x(function(d) { return d.x; })
// //                    .y(function(d) { return d.y; });
// //      //aMen * 1900 +bMen
// //      //aMen * 2013 +bMen
// //
// //          //  svg.append("line")          // attach a line
// //        //    .style("stroke", "black")  // colour the line
// //        //  .attr("x1", 100)     // x position of the first end of the line
// //        //    .attr("y1", 100)      // y position of the first end of the line
// //        //    .attr("x2", 200)     // x position of the second end of the line
// //        //    .attr("y2", 200);    // y position of the second end of the line
// //
// //            // Add the valueline path.
// //            svg.append("path")
// //                  .data(lineData)
// //                  .attr("class", "line")
// //                  .attr("d", valueline);
// //}
//
// var drawDots = function() {
//      // Draw dots for men.
//      svg.selectAll(".dot")
//           .data(data)
//           .enter().append("circle")
//           .attr("class", "dot")
//           .attr("r", 3.5)
//           .attr("cx", xMap)
//           .attr("cy", yMap)
//           .style("fill", function(d) { return color(cValue("Men"));})
//           .on("mouseover", function(d) {
//                tooltip.transition()
//                     .duration(200)
//                     .style("opacity", .9);
//
//                tooltip.html("("+d["Year"] + ","+d["Time"]+")" )
//                     .style("left", (d3.event.pageX + 5) + "px")
//                     .style("top", (d3.event.pageY + 20) + "px");
//          })
//          .on("mouseout", function(d) {
//              tooltip.transition()
//                   .duration(500)
//                   .style("opacity", 0);
//          });
//
//      // Draw dots for women.
// 	svg.selectAll()
//      	.data(data2)
//      	.enter().append("rect")
//           .attr("class", "dot")
//           .attr("x", xMap)         // Position the left of the rectangle
//           .attr("y", yMap)         // Position the top of the rectangle
//           .attr("height", 6)       // Set the height
//           .attr("width", 6)        // Set the width
//           .attr("rx", 2)           // Set the x corner curve radius
//           .attr("ry", 1)           // Set the y corner curve radius
// 		.style("fill", function(d) {  return color(cValue("Women"));})
// 		.on("mouseover", function(d) {
//                tooltip.transition()
//                     .duration(200)
//                     .style("opacity", .9);
//
//                tooltip.html("("+d["Year"] + ","+d["Time"]+")" )
//                     .style("left", (d3.event.pageX + 5) + "px")
//                     .style("top", (d3.event.pageY - 20) + "px");
//           })
// 		.on("mouseout", function(d) {
//                tooltip.transition()
//                     .duration(500)
//                     .style("opacity", 0);
// 		});
//
//
//
// }
//
// var drawLegend = function() {
//      var lineFunction = d3.line()
//           .x(function(d) { return d.x; })
//           .y(function(d) { return d.y; });
//
//     var legendRectSize = 18;
//     var legendSpacing = 4;
//
//     // Draw legend.
//     var legend = svg.selectAll('.legend')
//           .data(color.domain())
//           .enter()
//           .append('g')
//           .attr('class', 'legend')
//           .attr('transform', function(d, i) {
//                var height = legendRectSize + legendSpacing;
//                var offset =  height * color.domain().length / 2;
//                var horz = 25 * legendRectSize;
//                var vert = i * height - offset;
//                return 'translate(' + horz + ',' + vert + ')';
//           });
//
//      legend.append('rect')
//           .attr('width', legendRectSize)
//           .attr('height', legendRectSize)
//           .style('fill', color)
//           .style('stroke', color);
//
//      legend.append('text')
//           .attr('x', legendRectSize + legendSpacing)
//           .attr('y', legendRectSize - legendSpacing)
//           .text(function(d) { return d; });
// }
