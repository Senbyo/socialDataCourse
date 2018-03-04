
var dataset;
var svg;

var w = 900;
var h = 500;

var colors = d3.scaleOrdinal(d3.schemeCategory10);


d3.json("nyc.json", function(error, json)  {
	if (error) {
		console.log(error);
	} else {

		dataset = json;

		generateVisualization()

	}
});


var generateVisualization = function(){

	svg = d3.select("#geo").append("svg").attr("width", w).attr("height", h);


	var projection = d3.geoMercator()
						.center([-73.94, 40.70])
						.scale(40000)
						.translate([w/2, h/2]);

	//use projection on path to get propper wrapping of the lon/lat
	var path = d3.geoPath()
				.projection(projection);

	svg.selectAll("path")
		.data(dataset.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("fill", function(d, i){
			return colors(i);
		});

}