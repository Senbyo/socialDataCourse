//---------------- Global variables ----------------------
var dataset;
var svgChoropleth;


var svgBarChart;
var xDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
var padding = 40;
var yPadding = 100;
var barchartWidth = 404;

var colors = d3.scaleOrdinal(d3.schemeCategory10);

var choroplethWidth = 500;
var choroplethHeight = 500;
var w = 550;
var h = 500;



//---------------- scales ----------------------
var xScale = d3.scaleBand()
		.domain(xDomain)
		.range([padding, w - padding])
		.paddingInner(0.1);

var yScale = d3.scaleLinear()
		.domain([0, 50])
		.range([h- yPadding, yPadding]);


//---------------- Axis ----------------------
var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);



//---------------- loading nyc data ----------------------
d3.json("nyc.json", function(error, json)  {
	if (error) {
		console.log(error);
	} else {

		dataset = json;

		generateChoropleth();
		generateBarChart();

	}
});
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
	console.log(startX);
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
	svgChoropleth = d3.select("#geo").append("svg").attr("width", choroplethWidth).attr("height", choroplethHeight);

	// Create marquee tool
	svgChoropleth
			.call(d3.drag()
			.on("start", function(){
				dragStarted(d3.mouse(this)) })
			.on("drag", function(){
				dragging(d3.mouse(this)) })
			.on("end",  function(){
				dragEnded(d3.mouse(this)) }));

	// Use projection on path to get propper wrapping of the lon/lat
	var projection = d3.geoMercator()
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

	// Marquee tool needs to drawn at the very end to be on top of everything else.
	marqueeRect = svgChoropleth.append("rect")
			.attr("id", "marquee")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 0)
			.attr("height", 0)
			.attr("fill", "orange")
			.attr("opacity", 0.5);

};

//---------------- Generate barchart ----------------------
var generateBarChart = function() {

	// Create SVG for bar chart
	svgBarChart = d3.select("#geo").append("svg").attr("width", w).attr("height", h);



	// Draw x-axis included values along the axis.
	svgBarChart.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - yPadding) + ")")
		.call(xAxis);

	// Draw y-axis included values along the axis.
	svgBarChart.append("g")
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

};