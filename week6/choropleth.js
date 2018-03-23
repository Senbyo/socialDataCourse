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
var timelineW = 900;
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


		generateTimeline();
		generateChoropleth();
		generateBarChart();
		generateMurders();

	}
});

//---------------- date object ----------------------
// Functions to parse timestamps
var parseUTCDate = d3.utcParse("%m/%d/%Y");
var formatUTCDate = d3.timeFormat("%Y-%m-%d");
var parseDate = d3.timeParse("%Y-%m-%d");

//---------------- scales ----------------------
var xScaleTimeline = d3.scaleTime()
						//.domain([
						//	new Date(2001, 01, 01),
						//	new Date(2016, 12, 32)
						//	])
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
var xAxisTimeline = d3.axisBottom(xScaleTimeline);
var yAxisTimeline = d3.axisLeft(yScaleTimeLine);


var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);
var yaxis;


var colors = d3.scaleQuantize()
				.domain([0,4])
				//.range(["rgb(237,248,233)", "rgb(186,228,179)","rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
				//.range(["rgb(242,240,247)","rgb(203,201,226)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)"]);
				.range(["rgb(242,240,247)",
						"rgb(218,218,235)",
						"rgb(188,189,220)",
						"rgb(158,154,200)",
						"rgb(117,107,177)"])
// var colors = d3.scaleOrdinal(d3.schemeCategory10);

//---------------- d3.brush functions ----------------------

function resetCircles() {
	if (d3.event.selection != null) {
		circles.attr("class", "un_brushed")
			.transition()
			//.ease(d3.easeBackIn)
			.attr("r", 2);
	
	}

}

function highlightCircles() {
	if (d3.event.selection != null) {
		var visible =  d3.select("#geo").selectAll(".visible");
		var hidden = d3.select("#geo").selectAll(".hidden");

		visible.attr("class", "un_brushed visible")
		hidden.attr("class", "un_brushed hidden")

		var brush_selection = d3.brushSelection(this);

		// Set brushed both for hidden and visible circles
		visible.filter(function() {
			var cx = d3.select(this).attr("cx");
			var cy = d3.select(this).attr("cy");
			console.log("checking");
			return checkCircle(brush_selection, cx, cy);
 	
			}).attr("class", "brushed visible")
			.transition()
			.attr("r", 3);

		hidden.filter(function() {
			var cx = d3.select(this).attr("cx");
			var cy = d3.select(this).attr("cy");
			console.log("checking");
			return checkCircle(brush_selection, cx, cy);
 	
			}).attr("class", "brushed hidden")
			.transition()
			.attr("r", 3);


		// Attempt to call a bar update on end of transition
		marqueeRect.transition()
			.duration(1000)
			.attr("opacity", 0);

	}
}

function checkCircle(brush_selection, cx, cy) {

	var x0 = brush_selection[0][0];
	var y0 = brush_selection[0][1];
	var x1 = brush_selection[1][0];
	var y1 = brush_selection[1][1];

	return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
}


// Consider to recal
function brushEnd() {
	// Return if nothing is selected
	if (!d3.event.selection) return;

	// Make selection go away
	//d3.select(this).call(brush.move, null);

	var brushedSelection = d3.selectAll(".brushed.visible").data()

	if (brushedSelection.length > 0 ){
		updateRects(brushedSelection)		
	} else {
		updateRects(murderDataSet)
	}
}

function highlightTimeLine() {

	if (d3.event.selection != null) {
		//circles.attr("class", "hidden un_brushed")

		var un_brushed =  d3.select("#geo").selectAll(".un_brushed");
		var brushed = d3.select("#geo").selectAll(".brushed");

		un_brushed.attr("class", "hidden un_brushed");
		brushed.attr("class", "hidden brushed");

		var brush_selection = d3.brushSelection(this);

		un_brushed.filter(function() {

			var date = new Date(this.__data__.Date);
			return checkDate(brush_selection, date);
 	
			}).attr("class", "visible un_brushed")
			.transition()
			.attr("r", 3);

		brushed.filter(function() {

			var date = new Date(this.__data__.Date);
			return checkDate(brush_selection, date);
 	
			}).attr("class", "visible brushed")
			.transition()
			.attr("r", 3);


		// Attempt to call a bar update on end of transition
		marqueeRect.transition()
			.duration(1000)
			.attr("opacity", 0);

	}
}

function checkDate(brush_selection, date) {

	var x0 = brush_selection[0];
	var x1 = brush_selection[1];

	return xScaleTimeline.invert(x0) <= date && date <= xScaleTimeline.invert(x1);
}


// Consider to recal
function brushEndTimeLine() {
	// Return if nothing is selected
	if (!d3.event.selection) return;

	var brushedSelection = d3.selectAll(".visible.brushed").data()

	if (brushedSelection.length > 0 ){
		updateRects(brushedSelection)		
	} else {
		updateRects(murderDataSet)
	}
}

var brushChoropleth = d3.brush()
			.on("brush", highlightCircles)
			.on("end", brushEnd);


var brushTimeline = d3.brushX()
			.on("brush", highlightTimeLine)
			.on("end", brushEndTimeLine);



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
};


//---------------- Generate timeline ------------------------
var generateTimeline = function() {
	svgTimeLine = d3.select('#geo').append('svg').attr('width', timelineW).attr('height', timelineH).attr('id', 'timeline');

	xScaleTimeline.domain([
		d3.min(murderDataSet, function(d) { return new Date(d.Date); }),
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

	// Call d3.brush and set it to work on this group
	svgTimeLine.append("g").call(brushTimeline);
}



//---------------- Generate choropleth ----------------------
var generateChoropleth = function(){

	// Create SVG for choropleth
	svgChoropleth = d3.select("#geo").append("svg").attr("width", choroplethWidth).attr("height", choroplethHeight).attr("id", "choropleth");

	// Create marquee tool
	/*
	svgChoropleth
			.call(d3.drag()
			.on("start", function(){
				dragStarted(d3.mouse(this)) })
			.on("drag", function(){
				dragging(d3.mouse(this)) })
			.on("end",  function(){
				dragEnded(d3.mouse(this)) }));
	*/

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

	// Marquee tool needs to drawn at the very end to be on top of everything else.
	marqueeRect = svgChoropleth.append("rect")
			.attr("id", "marquee")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 0)
			.attr("height", 0)
			.attr("fill", "orange")
			.attr("opacity", 0.5);

	// Call d3.brush and set it to work on this group
	svgChoropleth.append("g").call(brushChoropleth);
};

//---------------- Generate barchart ----------------------
var tooltipsRects;

var generateBarChart = function() {

	// Create SVG for bar chart
	svgBarChart = d3.select("#geo").append("svg").attr("width", w).attr("height", h);

	// Draw x-axis included values along the axis.



	d3.select('#marquee').attr("height")


	// Draw x-axis included values along the axis.
	svgBarChart.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - yPadding) + ")")
		.call(xAxis);

	// Draw y-axis included values along the axis.
	yaxis = svgBarChart.append("g")
		.attr("class", "axis yaxis")
		.attr("transform", "translate(" + (padding) + ",0)")
		.call(yAxis);

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
     	.attr("class", "xAxisLabel")

	rectsGrp = svgBarChart.append("g");

	getHours(murderDataSet);	

	var maxValue = d3.max(hours);
	rescale(maxValue, 500);

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

	tooltipsRects = rects.append("title")
			.text(function(d){
			return "Murders: " + hours[d];
		});

};

var getHours = function(data) {
	hours = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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

	tooltipsRects.text(function(d){
			return "Murders: " + hours[d];
		});

};


/*
"rgb(242,240,247)"
"rgb(218,218,235)"
"rgb(188,189,220)"
"rgb(158,154,200)"
"rgb(117,107,177)"
"rgb(84,39,143)"
*/
