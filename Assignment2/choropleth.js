//---------------- Global variables ----------------------
var dataset;
var svgChoropleth;
var svgTimeLine;
var svgBarChart;
var projection;
var rectsGrp;
var selection;
var circles;
var rects;
var dataSeries;
var line;
var brushTimeLineGroup;
var brushChoroplethGroup;
var brushBarChartGroup;

var murderDataSet;
var hours;
var xDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
var padding = 40;
var yPadding = 100;
var barchartWidth = 404;

var choroplethWidth = 500;
var choroplethHeight = 500;
var w = 550;
var h = 500;
var timelineW = 1200;
var timelineH = 300;

//---------------- row converter ----------------------
var rowConverter = function(d) {
		dateSplit = d.Date.split("/")
		return {
				Hour: parseInt(d.Hour),
				Lon: d.Longitude,
				Lat: d.Latitude,
				Loc: d.Location,
				Time: d.Full_Time,
				Date: d.Date
				//Date: new Date(dateSplit[2], dateSplit[1], dateSplit[0])
				//Date: parseDate(formatDate(new Date(d.Date)))
			}
};

//---------------- loading murder data ----------------------
d3.csv("murder_data_processed.csv", rowConverter, function(error, data){

	if (error) {
		console.log(error);
	} else {
		//console.log(data);
		murderDataSet = data;

		dataSeries = d3.nest()
		  .key(function(d) { return d.Date; })
		  .rollup(function(v) { return v.length; })
		  .entries(data);

	  	//console.log(dataSeries)


	}
});

//---------------- loading nyc data ----------------------
d3.json("nyc.json", function(error, json)  {
	if (error) {
		console.log(error);
	} else {

		dataset = json;

		generateChoropleth();
		generateBarChart();
		generateMurders();
		generateTimeline();
	}
});

//---------------- date object ----------------------
// Functions to parse timestamps
var parseUTCDate = d3.utcParse("%m/%d/%Y");
var formatUTCDate = d3.timeFormat("%Y-%m-%d");
var parseDate = d3.timeParse("%Y-%m-%d");

//---------------- scales ----------------------
var xScaleTimeline = d3.scaleTime()
						.range([padding, timelineW - padding]);


var yScaleTimeLine = d3.scaleLinear()
						.domain([0, 9])
						.range([timelineH - padding, padding]);


var xScale = d3.scaleBand()
		.domain(xDomain)
		.range([padding, w - padding])
		.paddingInner(0.05);

var yScale = d3.scaleLinear()
		.domain([0, 30])
		.range([h- yPadding, yPadding]);

//---------------- Axis ----------------------
var xAxisTimeline = d3.axisBottom(xScaleTimeline).ticks(11);
var yAxisTimeline = d3.axisLeft(yScaleTimeLine);


var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);
var yaxis;


var colors = d3.scaleQuantize()
				.domain([0,4])
				.range(["rgb(242,240,247)",
						"rgb(218,218,235)",
						"rgb(188,189,220)",
						"rgb(158,154,200)",
						"rgb(117,107,177)"])

//---------------- d3.brush functions ----------------------

function highlightCircles() {
	if (d3.event.selection != null) {
		var visible =  d3.select("#geo").selectAll(".visible");

		visible.attr("class", "un_brushed visible")

		var brush_selection = d3.brushSelection(brushChoroplethGroup.node());
		if (brush_selection !== null){
			// Set brushed both for hidden and visible circles
			visible.filter(function() {
				var cx = d3.select(this).attr("cx");
				var cy = d3.select(this).attr("cy");
				return checkCircle(brush_selection, cx, cy);
	 	
				}).attr("class", "brushed visible")
				.transition()
				.attr("r", 3);
		}
	}
}

function checkCircle(brush_selection, cx, cy) {
	var x0 = brush_selection[0][0];
	var y0 = brush_selection[0][1];
	var x1 = brush_selection[1][0];
	var y1 = brush_selection[1][1];

	return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}

function highlightTimeLine() {

	if (d3.event.selection != null) {
		circles.classed("hidden", true);
		circles.classed("visible", false);

		var brush_selection = d3.brushSelection(brushTimeLineGroup.node());
		var barBoundry = getBarChartBoundry();

		circles.filter(function(d) {

			var date = new Date(this.__data__.Date);
			return compareHourAndDate(barBoundry, brush_selection, date, d);
 	
			}).classed("visible", true)
			.transition()
			.attr("r", 3);

		highlightCircles();
	}
}
function compareHourAndDate(barBoundry, timeline_selection, date, d){
	var x0 = timeline_selection[0];
	var x1 = timeline_selection[1];
    var rounded_selection = barBoundry[0];
    var hours = barBoundry[1];

	return xScaleTimeline.invert(x0) <= date && date <= xScaleTimeline.invert(x1)
							&& hours[0] <= d.Hour && d.Hour < hours[1];

}
// Consider to recal
function brushEnd() {
	// Return if nothing is selected
	if (!d3.event.selection) return;

	var brushedSelection = d3.selectAll(".visible.brushed").data()

	if (brushedSelection.length <= 0)
		{

		var brush_selection = d3.brushSelection(brushTimeLineGroup.node());

		brushedSelection = d3.selectAll(".un_brushed").filter(function(d){
			var x0 = brush_selection[0];
			var x1 = brush_selection[1];
			var date = new Date(this.__data__.Date);

			return xScaleTimeline.invert(x0) <= date && date <= xScaleTimeline.invert(x1);
		}).data();

	}

	if (brushedSelection.length > 0 ){
		updateRects(brushedSelection)		
	} else {
		updateRects(murderDataSet)
	}
}

function brushended() {
	if (!d3.event.sourceEvent) return; // Only transition after input.
	if (!d3.event.selection) return; // Ignore empty selections.

	var brush_selection = d3.brushSelection(brushTimeLineGroup.node());
    var boundry = getBarChartBoundry();

	d3.select(this).transition().call(d3.event.target.move, boundry[0]);

	// Filter visible circles
	circles.classed("hidden", true);
	circles.classed("visible", false);

	circles.filter(function(d) {

		var date = new Date(this.__data__.Date);
		return compareHourAndDate(boundry, brush_selection, date, d);
	
		})
		.classed("visible", true)
		.transition()
		.attr("r", 3);

	highlightCircles();

	boundry = getBarChartBoundry();
	
	rects.attr("fill", "rgb(158,154,200)");

	rects.filter(function(d, i) {

		return boundry[1][0] <= i && i < boundry[1][1];
	
		})
		.attr("fill", "rgb(84,39,143)");

	if ( d3.selectAll(".visible.brushed").data().length > 0 ){
		brushEnd();
	}


}


function getBarChartBoundry() {

	var selection = d3.brushSelection(brushBarChartGroup.node());

	var rounded_selection = [0, 0];
	var xStart_dif = xScale.step();
	var xEnd_dif = xScale.step();
	var hours = [0, 0];

	for (number in xScale.domain()){
		xStartFit = Math.abs(selection[0] - xScale(number));
		xEndFit = Math.abs(selection[1] - xScale(number));

		if (xStartFit < xStart_dif){
			xStart_dif = xStartFit
			rounded_selection[0] = xScale(parseInt(number));
			hours[0] = number;

		}
		if (xEndFit < xEnd_dif){
			xEnd_dif = xEndFit
			rounded_selection[1] = xScale(parseInt(number));
			hours[1] = number;
		}
	}
	// Check end case
	if (Math.abs(selection[1] - xScale.range()[1]) < xEnd_dif){
			rounded_selection[1] = xScale.range()[1];
			hours[1]  = 24;  		
		}

	return [rounded_selection, hours];

}

var brushChoropleth = d3.brush()
			.on("brush", highlightCircles)
			.on("end", brushEnd);


var brushTimeline = d3.brushX()
			.extent([[xScaleTimeline.range()[0], yScaleTimeLine.range()[1]], [xScaleTimeline.range()[1], yScaleTimeLine.range()[0]]])
			.on("brush", highlightTimeLine)
			.on("end", brushEnd);

var brushBarChart = d3.brushX()
			.extent([[xScale.range()[0], yScale.range()[1]], [xScale.range()[1], yScale.range()[0]]])
			.on("end", brushended);

//---------------- visualizing murder data ----------------------
var tooltipCircles;
var generateMurders = function(d) {

	// Adding circles for murders
	circles = svgChoropleth.selectAll("circle")
			.data(murderDataSet)
			.enter()
			.append("circle")
			.attr("class", "un_brushed hidden")
			.attr("cx", function(d){
				return projection([d.Lon, d.Lat])[0];
			})
			.attr("cy", function(d){
				return projection([d.Lon, d.Lat])[1];
			})
			.attr("r", 2);
	tooltipCircles = circles.append("title")
			.text(function(d){
				return "Location: " + d.Loc + "\n Date: " + d.Time + " "+  d.Date;
			});

	// Call d3.brush and set it to work on this group
	brushChoroplethGroup = svgChoropleth.append("g")
							.call(brushChoropleth);
};


//---------------- Generate timeline ------------------------
var generateTimeline = function() {
	svgTimeLine = d3.select('#timeline').append('svg').attr('width', timelineW).attr('height', timelineH).attr('id', 'timeline');

	xScaleTimeline.domain([
		//d3.min(murderDataSet, function(d) { return new Date(d.Date); }),
		new Date("/12/31/2005"),
		d3.max(murderDataSet, function(d) { return new Date(d.Date); })
	])

	var pathGroup = svgTimeLine.append('g')

	line = d3.line()
		.x(function(d, i) {
			return xScaleTimeline(new Date(d.key)); 
		})
		.y(function(d) { 
			return yScaleTimeLine(d.value); 
		});

	var path = pathGroup.append('path')
		.datum(dataSeries)
		.attr("class", "line")
		.attr("d", line);

	// Call d3.brush and set it to work on this group
	brushTimeLineGroup = svgTimeLine.append("g")
				.call(brushTimeline);

	// Draw x-axis included values along the axis.
	svgTimeLine.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (timelineH - padding) + ")")
		.call(xAxisTimeline);

	// Draw y-axis included values along the axis.
	svgTimeLine.append("g")
		.attr("class", "axis yaxis")
		.attr("transform", "translate(" + (padding) + ",0)")
		.call(yAxisTimeline);

	// Adding text to the y-axis
  	svgTimeLine.append("text")
     	.attr("transform", "rotate(-90)")
     	.attr("x", 0 - (timelineH / 2))
     	.attr("y", 0 )
     	.attr("dy", "1em")
     	.style("text-anchor", "middle")
     	.text("# of Murders Committed")
     	.attr("class", "yAxisLabel");

	// Adding text to the x-axis
  	svgTimeLine.append("text")
     	.attr("x", (timelineW/2))
     	.attr("y", (timelineH - padding + 10))
     	.attr("dy", "1em")
     	.style("text-anchor", "middle")
     	.text("Year")
     	.attr("class", "xAxisLabel")


	brushTimeLineGroup.call(brushTimeline.move, [xScaleTimeline.range()[0], xScaleTimeline(new Date("01/01/2007"))]);


};
/*
var selection = d3.brushSelection(brushTimeLineGroup.node())
brushTimeline.move(selection, [xScaleTimeline(new Date("01/01/2010")), xScaleTimeline(new Date("01/01/2011"))]);
*/


//---------------- Generate choropleth ----------------------
var generateChoropleth = function(){

	// Create SVG for choropleth
	svgChoropleth = d3.select("#geo").append("svg").attr("width", choroplethWidth).attr("height", choroplethHeight).attr("id", "choropleth");

	// Use projection on path to get propper wrapping of the lon/lat
	projection = d3.geoMercator()
						.center([-73.95, 40.70])
						.scale(50000)
						.translate([w/2, h/2]);

	// Create path
	var path = d3.geoPath()
				.projection(projection);

	// Draw path
	svgChoropleth.selectAll("path")
		.data(dataset.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("fill", function(d, i){
			return colors(i);
		});

	var names = svgChoropleth.append("g")
		.attr("id", "names");
	
	names.selectAll("text")
		.data(dataset.features)
		.enter()
		.append("text")
		.attr("x", function(d) {
			return path.centroid(d)[0];
		})
		.attr("y", function(d) {
			return path.centroid(d)[1];
		})
		.text(function(d) {
			return d.properties.BoroName;
		})
		.attr("class", "boroNames");


};

//---------------- Generate barchart ----------------------
var tooltipsRects;

var generateBarChart = function() {

	// Create SVG for bar chart
	svgBarChart = d3.select("#geo").append("svg").attr("width", w).attr("height", h);

	rectsGrp = svgBarChart.append("g");

	getHours(murderDataSet);	

	rects = rectsGrp.selectAll("rects")
		.data(xDomain)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			return xScale(d);
		})
		.attr("y", function(d) {
			return yScale(hours[d]);
		})
		.attr("height", function(d) {
			return yScale(0) - yScale(hours[d]);
		})
		.attr("width", xScale.bandwidth())
		.attr("fill", "rgb(84,39,143)");

	// Call d3.brush and set it to work on this group
	brushBarChartGroup = svgBarChart.append("g")
							.call(brushBarChart);

	// Draw y-axis included values along the axis.
	yaxis = svgBarChart.append("g")
		.attr("class", "axis yaxis")
		.attr("transform", "translate(" + (padding) + ",0)")
		.call(yAxis);

	// Draw x-axis included values along the axis.
	svgBarChart.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - yPadding) + ")")
		.call(xAxis);

	// Adding text to the y-axis
  	svgBarChart.append("text")
     	.attr("transform", "rotate(-90)")
     	.attr("x", 0 - (h / 2))
     	.attr("y", 0 )
     	.attr("dy", "1em")
     	.style("text-anchor", "middle")
     	.text("# of Murders Committed")
     	.attr("class", "yAxisLabel");

	// Adding text to the x-axis
  	svgBarChart.append("text")
     	.attr("x", (w/2))
     	.attr("y", (h - padding * 2))
     	.attr("dy", "1em")
     	.style("text-anchor", "middle")
     	.text("Hour")
     	.attr("class", "xAxisLabel");

	var maxValue = d3.max(hours);
	rescale(maxValue, 500);

	brushBarChartGroup.call(brushBarChart.move, [xScale.range()[0], xScale.range()[1]]);


};

var getHours = function(data) {
	hours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (i = 0; i < data.length; i++){
		hours[data[i].Hour] += 1;
	}
};

var rescale = function(scaleMax, duration) {
	    yScale.domain([0, scaleMax]);
	    yaxis.transition().duration(duration)
		.ease(d3.easeQuadIn)
		    .call(yAxis);
};

var updateRects = function(selection) {

	getHours(selection);

	var maxValue = d3.max(hours);
	rescale(maxValue, 500);

	rects.transition()
		.attr("y", function(d) {
			return yScale(hours[d]);
		})
		.attr("height", function(d) {
			return yScale(0) - yScale(hours[d]);
		});
};

var animateTimeLine= function(){

		brushTimeLineGroup
		.call(brushTimeline.move, [xScaleTimeline(new Date("01/01/2006")),xScaleTimeline(new Date("01/01/2007"))])
		.transition()
		.delay(500)
		.ease(d3.easeLinear)
		.duration(5000)
		.call(brushTimeline.move, [xScaleTimeline(new Date("01/01/2016")),xScaleTimeline(new Date("01/01/2017"))]);
};
