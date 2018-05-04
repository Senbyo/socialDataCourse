//---------------- Global variables ----------------------
var dataset;

var terrorDataSet;
var dataSeriesCountry;

// Dots on map
var circles;

var svgChoropleth;
var choroplethWidth = 800;
var choroplethHeight = 800;
var w = 800; // Why do we have two width and two height?
var h = 800;
var projection;
var colors = d3.scaleQuantize()
				.range(["rgb(188,189,220)",
						"rgb(158,154,200)",
						"rgb(128,125,186)",
						"rgb(106,81,163)",
						"rgb(84,39,143)",
						"rgb(63,0,125)"]);
// Legend variables
var legendRightOffset = 1000; // Makes sure it doesn't overlap with the choropleth

//---------------- Row converter ----------------------
var rowConverter = function(d) {
    dateSplit = d.Date.split("/");
    return {
        Date: d.Date,
        Country: d.CurrentCountry,
		OldCountry: d.Country,
		Region: d.Region,
        City: d.City,
		Latitude: d.Latitude,
        Longitude: d.Longitude,
		AttackType: d.AttackType,
		Victims: d.Victims,
		Killed: d.Killed,
		Target: d.Target,
		Summary: d.Summary,
		Group: d.Group,
		Target_type: d.Target_type,
		Weapon_type: d.Weapon_type,
		Motive: d.Motive,
		Year: d.Year,
		Month: d.Month,
		Day: d.Day
    }
};

//---------------- Load terror data ----------------------
d3.csv("data/terror_EU_processed_data.csv", rowConverter, function(error, data){

    if (error) {
        console.log(error);
    } else {
        console.log(data);
        terrorDataSet = data;

        // Nest the data by country, effectively counting the numbers of attacks in each country.
        dataSeriesCountry = d3.nest()
			.key(function (d) { return d.Country; })
			.rollup(function(v) { return v.length; })
			.entries(data);

        console.log(dataSeriesCountry);

		// Set domain for colors
		colors.domain([
			0,
			d3.max(dataSeriesCountry, function (d) { return d.value })
		]);

    }
});

// GEO json found @ http://grokbase.com/t/gg/d3-js/1372gq18j9/geojson-maps
//---------------- loading Europa data ----------------------
d3.json("continent_Europe_subunits_georgia_cypress.json", function(error, json)  {

	if (error) {

		console.log(error);

	} else {

		// Set default value to 0.
        for (var k = 0; k < json.features.length; k++) {

            json.features[k].properties.value = 0;

        }

		// Merge the number of attacks into the GeoJSON data.
		for (var i = 0; i < dataSeriesCountry.length; i++) {

			// Grab the country name
			var dataCountry = dataSeriesCountry[i].key;

			// Grab the value and convert from string to float
			var dataValue = parseFloat(dataSeriesCountry[i].value);

			// Find the corresponding country inside the GeoJSON
			for (var j = 0; j < json.features.length; j++) {

				var jsonCountry = json.features[j].properties.sovereignt;

				// Check if the country name of the data set is included in the name of the JSON.
				// For example could the name be "Slovakia" in the data but "Republic of Slovakia" in the JSON.
				if (jsonCountry.includes(dataCountry)) {

					// Copy the data value into the JSON
					json.features[j].properties.value = dataValue;

				}

			}

		}

		dataset = json;
		console.log(dataset);
		generateChoropleth();
		generateMurders();
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
		.style("fill", function(d){

			var value = d.properties.value;

			if (value >= 0) {
				return colors(value);
			} else {
				return "rgb(255,0,0)";
			}
		});

	// Create legend
    svgChoropleth.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendRightOffset + ", 20)");

    var legend = d3.legendColor()
        .labelFormat(d3.format(".0f"))
		.title("Number of attacks")
		.titleWidth(200)
        .scale(colors);

    svgChoropleth.select(".legend")
        .call(legend);

};



//---------------- Visualizing terror attacks ----------------------
var tooltipCircles;
var generateMurders = function() {

    // Adding circles for murders
    circles = svgChoropleth.selectAll("circle")
        .data(terrorDataSet)
        .enter()
        .append("circle")
        .attr("class", "un_brushed hidden")
        .attr("cx", function(d) {
            return projection([d.Longitude, d.Latitude])[0];
        })
        .attr("cy", function(d) {
            return projection([d.Longitude, d.Latitude])[1];
        })
        .attr("r", function (d) {
			return Math.sqrt(d.Killed);
        });

    tooltipCircles = circles.append("title")
        .text(function(d){
            return "Date: "+  d.Date;
        });
};


var showCircles = function() {

    console.log("Showing circles");

    circles = d3.select("#choro").selectAll("circle")
        .classed("visible", true)
        .classed("hidden", false);

};

var hideCircles = function() {

	console.log("Hidding circles");

    circles = d3.select("#choro").selectAll("circle")
        .classed("visible", false)
        .classed("hidden", true);

};

function hideDensityColours() {

    svgChoropleth.selectAll("path")
        .style("fill", function(){
            return "rgb(188,189,220)";
        });

}

function showDensityColours() {

    svgChoropleth.selectAll("path")
        .data(dataset.features)
        .style("fill", function(d){

            var value = d.properties.value;

            if (value >= 0) {
                return colors(value);
            } else {
                return "rgb(255,0,0)";
            }
        });

}



var drawChoroplethTab1 = function() {

	hideCircles();
	showDensityColours();

};



var drawChoroplethTab2 = function() {

	showCircles();
	hideDensityColours();

};

var drawChoroplethTab3 = function() {

};