//---------------- Global variables ----------------------
var dataset;
var svgChoropleth;
var projection;
var rectsGrp;
var selection;
var circles;
var rects;

var murderDataSet;
var svgBarChart;
var hours;
var xDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
var padding = 40;
var yPadding = 100;
var barchartWidth = 404;

var choroplethWidth = 500;
var choroplethHeight = 500;
var w = 550;
var h = 500;

//---------------- d3.brush functions ----------------------

function resetCircles() {
	if (d3.event.selection != null) {
		circles.attr("class", "un_brushed")
			.transition()
			//.ease(d3.easeBackIn)
			.attr("r", 2);
	
	}

}
function recalculateBarChart() {
	var brushedSelection = d3.selectAll(".brushed").data()

	if (brushedSelection.length > 0 ){
		updateRects(brushedSelection)		
	} else {
		updateRects(murderDataSet)
	}
}

function highlightCircles() {
	if (d3.event.selection != null) {
		circles.attr("class", "un_brushed")
			//.transition()
			//.ease(d3.easeBackIn)
			//.attr("r", 2);

		var brush_selection = d3.brushSelection(this);

		circles.filter(function() {
			var cx = d3.select(this).attr("cx");
			var cy = d3.select(this).attr("cy");
			return checkCircle(brush_selection, cx, cy);
 	
			}).attr("class", "brushed")
			.transition()
			.attr("r", 3);

		// Attempt to call a bar update on end of transition
		marqueeRect.transition()
			.duration(1000)
			.attr("opacity", 0)
			.each("end", recalculateBarChart());

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
	d3.select(this).call(brush.move, null);
}

var brush = d3.brush()
			.on("start", resetCircles)
			.on("brush", highlightCircles)
			.on("end", brushEnd);

//---------------- scales ----------------------
var xScale = d3.scaleBand()
		.domain(xDomain)
		.range([padding, w - padding])
		.paddingInner(0.05);

var yScale = d3.scaleLinear()
		.domain([0, 30])
		.range([h- yPadding, yPadding]);


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

//---------------- Axis ----------------------
var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);
var yaxis;

//---------------- row converter ----------------------
var rowConverter = function(d) {
		return {
				Index: parseInt(d.Index),
				Hour: parseInt(d.Hour),
				Lon: d.Longitude,
				Lat: d.Latitude,
				Loc: d.Location,
				Time: d.Full_Time,
				Date: d.Date
			}
};

//---------------- loading murder data ----------------------
d3.csv("murder_data_processed.csv", rowConverter, function(error, data){

	if (error) {
		console.log(error);
	} else {
		//console.log(data);
		murderDataSet = data;
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

	}
});

//---------------- visualizing murder data ----------------------
var tooltipCircles
var generateMurders = function(d) {

	// Adding circles for murders
	circles = svgChoropleth.selectAll("circle")
			.data(murderDataSet)
			.enter()
			.append("circle")
			.attr("class", "un_brushed")
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

//---------------- marquee functionality ----------------------
var marqueeRect;
var startX;
var startY;
var width;
var height;

var dragStarted = function(xy){ 
	//make sure that the marquee starts with invisible

	startX = xy[0];
	startY = xy[1];
	marqueeRect.transition()
			.duration(0)
			.attr("x", xy[0])
			.attr("y", xy[1])
			.attr("opacity", 0.5);
}

var dragging = function (xy){

	var x = parseInt(d3.select('#marquee').attr("x"));
	var y = parseInt(d3.select('#marquee').attr("y"));
	var width = xy[0] - x;
	var height = xy[1] - y;

	if (xy[0] < startX){
		x = xy[0];
		var difference =  parseInt(d3.select('#marquee').attr("x")) - xy[0];
		width = parseInt(d3.select('#marquee').attr("width")) + difference;
	}

	if (xy[1] < startY){
		y = xy[1];
		var difference = parseInt(d3.select('#marquee').attr("y")) - xy[1];
		height = parseInt(d3.select('#marquee').attr("height")) + difference;
	}

	marqueeRect.transition()
			.duration(0)
			.attr("x", x)
			.attr("y", y)
			.attr("width", width)
			.attr("height", height);
}

var dragEnded = function (xy){

	marqueeRect.transition()
			.duration(0)
			.attr("width", 0)
			.attr("height", 0)
			.attr("x", 0)
			.attr("y", 0);
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
	svgChoropleth.append("g").call(brush);
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
