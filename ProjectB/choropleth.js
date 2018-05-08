//---------------- Global variables ----------------------
var jsonChoro;

var terrorDataSet;
var dataSeriesCountry;


var dataSeriesGroup;

// Dots on map
var circles;

var topGroups = [];
var keysGroup = ["Others"];

var svgChoropleth;
var svgTimeLine;

var wSvgChoro = 1200;
var hSvgChoro = 800;
var wChoro = 1200;
var hChoro = 800;
var projection;
var colorsCountry = d3.scaleQuantize()
				.range(["#bcbddc",
						"#9e9ac8",
						"#807dba",
						"#6a51a3",
						"#54278f",
						"#3f007d"]);

var colorsGroup11 = d3.scaleOrdinal()
							.range(['#808080',
									'#67001f',
									'#b2182b',
									'#d6604d',
									'#f4a582',
									'#fddbc7',
									'#f7f7f7',
									'#d1e5f0',
									'#92c5de',
									'#4393c3',
									'#2166ac',
									'#053061']);

var colorsGroup9 = d3.scaleOrdinal()
							.range(['#b2182b',
									'#d6604d',
									'#f4a582',
									'#fddbc7',
									'#f7f7f7',
									'#d1e5f0',
									'#92c5de',
									'#4393c3',
									'#2166ac']);

// Timeline variables
var wSvgTimeLine = 1200;
var hSvgTimeLine = 200;
var padding = 45;

var xScaleTimeline = d3.scaleTime()
    .range([padding, wSvgTimeLine - padding]);

var yScaleTimeLine = d3.scaleLinear()
    .domain([0, 60])
    .range([hSvgTimeLine - padding, padding]);

var xAxisTimeline = d3.axisBottom(xScaleTimeline).ticks(11);
var yAxisTimeline = d3.axisLeft(yScaleTimeLine);
var line;

// Legend variables
var legendRightOffset = 850; // Makes sure it doesn't overlap with the choropleth

//---------------- Row converter ----------------------
var rowConverter = function(d) {
    //dateSplit = d.Date.split("/");
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

		terrorDataSet = data;

        // Nest the data by country, effectively counting the numbers of attacks in each country.
        dataSeriesCountry = d3.nest()
			.key(function (d) { return d.Country; })
			.rollup(function(v) { return v.length; })
			.entries(data);

		// Set domain for colors for countries
		colorsCountry.domain([
			0,
			d3.max(dataSeriesCountry, function (d) { return d.value })
		]);


        dataSeriesGroup = d3.nest()
			.key(function (d) {
				return d.Group
            })
            .rollup(function(v) { return v.length; })
			.entries(data)
			.sort(function(a, b) {
				return d3.descending(a.value, b.value)
			});


        // Extract the groups top x groups that have performed most attacks.
		var i = 0;
        while (topGroups.length < 11) {

            if (dataSeriesGroup[i].key !== "Unknown") {
                topGroups.push(dataSeriesGroup[i]);
			}

            i++;
		}

		// Extract the keys
        for (var j = 0; j < topGroups.length; j++) {
            keysGroup.push(topGroups[j].key);
        }

        colorsGroup11.domain(keysGroup);

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

        jsonChoro = json;

		generateChoropleth();
		generateMurders();
		generateTimeline()
	}
});



//---------------- Legends Functionality ----------------------

var legendDensityTop = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .title("Number of attacks")
    .titleWidth(200)
    .scale(colorsCountry);


var legendOrganisationTop = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .title("Organisation")
    .titleWidth(200)
    .scale(colorsGroup11);

function drawLegendTop(legendToDraw) {
	// Create legend
    svgChoropleth.append("g")
        .attr("id", "legendTop")
        .attr("class", "legend")
        .attr("transform", "translate(" + legendRightOffset + ", 20)");

    svgChoropleth.select(".legend")
        .call(legendToDraw);
}

//---------------- Generate choropleth ----------------------
var generateChoropleth = function(){

	// Create SVG for choropleth
	svgChoropleth = d3.select("#choro").append("svg").attr("width", wSvgChoro).attr("height", hSvgChoro).attr("id", "choropleth");

	// Use projection on path to get propper wrapping of the lon/lat
	projection = d3.geoAzimuthalEqualArea()
						.center([20, 55])
						.scale(900)
						.translate([wChoro/3, hChoro/2]);

	// Create path
	var path = d3.geoPath()
				.projection(projection);

	// Draw path
	svgChoropleth.selectAll("path")
		.data(jsonChoro.features)
		.enter()
		.append("path")
		.attr("class", "choroPath")
		.attr("d", path)
		.style("fill", function(d){

			var value = d.properties.value;

			if (value >= 0) {
				return colorsCountry(value);
			} else {
				return "#ff0000";
			}
		});

    drawLegendTop(legendDensityTop);

};


//---------------- Generate timeline ------------------------
var generateTimeline = function() {
    svgTimeLine = d3.select('#timeline').append('svg').attr('width', wSvgTimeLine).attr('height', hSvgTimeLine).attr('id', 'timeline');

    xScaleTimeline.domain([
        new Date("01/01/1970"),
        new Date("12/31/2016")
    ]);

    var pathGroup = svgTimeLine.append('g');

    var counter = 0

    var line = d3.line()
        .x(function(d) {
            dateSplit = d.key.split("/");

            newDate = dateSplit[1] + "/" + dateSplit[0] + "/" + dateSplit[2];

            if (counter < 100) {
            	console.log(newDate);
            	console.log(new Date(newDate))
				console.log()
			}

			counter = counter + 1;
        	return xScaleTimeline(new Date(newDate)) })
        .y(function(d) { return yScaleTimeLine(d.value); });

    var dataSeries = d3.nest()
        .key(function(d) { return d.Date; })
        .rollup(function(v) { return v.length; })
        .entries(terrorDataSet);

    pathGroup.append('path')
        .datum(dataSeries)
        .attr("class", "line")
        .attr("d", line);

    // Call d3.brush and set it to work on this group
    /*brushTimeLineGroup = svgTimeLine.append("g")
        .call(brushTimeline);*/

    // Draw x-axis included values along the axis.
    svgTimeLine.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (hSvgTimeLine - padding) + ")")
        .call(xAxisTimeline);

    // Draw y-axis included values along the axis.
    svgTimeLine.append("g")
        .attr("class", "axis yaxis")
        .attr("transform", "translate(" + (padding) + ",0)")
        .call(yAxisTimeline);

    // Adding text to the y-axis
    svgTimeLine.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (hSvgTimeLine / 2))
        .attr("y", 0 )
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of attacks")
        .attr("class", "yAxisLabel");

    // Adding text to the x-axis
    svgTimeLine.append("text")
        .attr("x", (wSvgTimeLine/2))
        .attr("y", (hSvgTimeLine - padding + 10))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Day")
        .attr("class", "xAxisLabel")


    //brushTimeLineGroup.call(brushTimeline.move, [xScaleTimeline.range()[0], xScaleTimeline(new Date("01/01/2007"))]);


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

    /*
    tooltipCircles = circles.append("title")
        .text(function(d){
            return "Date: " + d.Date + "\nCasualties: "+  d.Killed + "\nAttack Type: " + d.AttackType;
        });
	*/
};


var colorCirclesGroup = function() {
	circles.style("fill", function(d){

        var groupName = d.Group;

        if (keysGroup.includes(groupName)) {
            return colorsGroup11(groupName);
        } else {
            return colorsGroup11("Others");
        }
    });
};

var colorCirclesAttackType = function() {
    circles.style("fill", "black");
};

var showCircles = function(r, b) {

    circles.classed("visible", true)
		.classed("hidden", false)
		.attr("r", r);

    if (b) {
        colorCirclesGroup();
	} else {
        colorCirclesAttackType();
	}

};

var hideCircles = function() {

    circles.classed("visible", false).classed("hidden", true);

};

var showDensityColours = function () {

    svgChoropleth.selectAll(".choroPath")
        .style("fill", function(d){

            var value = d.properties.value;

            if (value >= 0) {
                return colorsCountry(value);
            } else {
                return "#ff0000";
            }
        });

};


var hideDensityColours = function() {

    svgChoropleth.selectAll(".choroPath")
        .style("fill", function(){
            return "#bcbddc";
        });

};

var hideAreaChart = function() {

    document.getElementById('area').hidden = true;

};

var showAreaChart = function() {

    document.getElementById('area').hidden = false;

};


//---------------- Functions for drawing each of the three tabs ----------------------

var drawChoroplethTab1 = function() {

	// What to hide.
	hideCircles();
    hideAreaChart();

	// What to show.
	showDensityColours();
    drawLegendTop(legendDensityTop);

};

var drawChoroplethTab2 = function() {

    // What to hide.
	hideDensityColours();
	hideAreaChart();

    // What to show.
    showCircles(2, true);
    drawLegendTop(legendOrganisationTop);


};

var drawChoroplethTab3 = function() {

    // What to hide.
    hideDensityColours();

    // What to show.
	showCircles(function (d) {
        return Math.sqrt(d.Killed);
    }, false);
	showAreaChart();

};
