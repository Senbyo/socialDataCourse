//---------------- Global variables ----------------------
var dataset;
var svgChoropleth;
var choroplethWidth = 800;
var choroplethHeight = 800;
var w = 800;
var h = 800;
var projection;
var colors = d3.scaleQuantize()
				.domain([0,69])
				.range(["rgb(188,189,220)",
						"rgb(158,154,200)",
						"rgb(128,125,186)",
						"rgb(106,81,163)",
						"rgb(84,39,143)",
						"rgb(63,0,125)"]);

// GEO json found @ http://grokbase.com/t/gg/d3-js/1372gq18j9/geojson-maps
//---------------- loading Europa data ----------------------
d3.json("continent_Europe_subunits_georgia_cypress.json", function(error, json)  {
	if (error) {
		console.log(error);
	} else {

		dataset = json;
		console.log(dataset)
		generateChoropleth();
	}
});


//---------------- Generate choropleth ----------------------
var generateChoropleth = function(){

	// Create SVG for choropleth
	svgChoropleth = d3.select("#choro").append("svg").attr("width", choroplethWidth).attr("height", choroplethHeight).attr("id", "choropleth");

	// Use projection on path to get propper wrapping of the lon/lat
	projection = d3.geoAzimuthalEqualArea()
						.center([20, 55])
						.scale(900)
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
			//console.log(i)
			//console.log(d.properties.gdp_md_est);
			return colors(50);
		});

	/*
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
			return d.properties.admin;
		})
		.attr("class", "name");
	*/
};