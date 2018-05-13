//---------------- Global variables ----------------------
var jsonChoro;

var terrorDataSet;
var dataSeriesCountry;
var dataSeriesGroup;
var dataSeriesAttackType;
var dataSeriesAttacksPerDay;

// Dots on map
var circles;
var tooltipCircles;

var topGroups = [];
var keysGroup = ["Others"];
var keysAttackType = [];

var pDescription;
var svgChoropleth;
var svgLegend;
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

var colorsGroup = d3.scaleOrdinal()
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

var colorsAttackType = d3.scaleOrdinal()
							.range(['#8c510a',
									'#bf812d',
									'#dfc27d',
									'#f6e8c3',
                                	'#f5f5f5',
									'#c7eae5',
									'#80cdc1',
									'#35978f',
									'#01665e']);

// Descriptions for tabs
var descriptionTab1 = "This is a plot over the continent of Europe, where the density of the number of attacks for each country are display in the period from 1970 to 2016." +
    "Hovering over a country on the plot will reveal the name of the country." +
    "Click on tab \"Organisations\" to continue the exploration.";
var descriptionTab2 = "And this is the description for tab 2";
var descriptionTab3 = "Finally this is the description for tab 3";

// Timeline variables
var wSvgTimeLine = 1200;
var hSvgTimeLine = 300;
var padding = 45;

var xScaleTimeline = d3.scaleTime()
    .range([padding, wSvgTimeLine - padding]);

var yScaleTimeLine = d3.scaleLinear()
    .range([hSvgTimeLine - padding, padding]);

var xAxisTimeline = d3.axisBottom(xScaleTimeline).ticks(11);
var yAxisTimeline = d3.axisLeft(yScaleTimeLine);
var line;
var pathGroup;
var tlLine;
var tlXaxis;
var tlYaxis;
var tlXaxisText;
var tlYaxisText;

// Brush variables
var brushTimeLineGroup;

//---------------- Row converter ----------------------
var rowConverter = function(d) {
    //dateSplit = d.Date.split("/");
    return {
        Date: d.DateStupidJS,
        Country: d.CurrentCountry,
		OldCountry: d.Country,
		Region: d.Region,
        City: d.City,
		Latitude: d.Latitude,
        Longitude: d.Longitude,
		AttackType: d.AttackType,
		Victims: parseInt(d.Victims),
		Killed: parseInt(d.Killed),
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
d3.csv("data/terror_EU_processed_data_stupidDate.csv", rowConverter, function(error, data){

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

        colorsGroup.domain(keysGroup);


        dataSeriesAttackType = d3.nest()
            .key(function (d) { return d.AttackType })
            .entries(data);

        // Extract the keys
        for (var k = 0; k < dataSeriesAttackType.length; k++) {
            keysAttackType.push(dataSeriesAttackType[k].key);
        }

        colorsAttackType.domain(keysAttackType);

        loadJson();

    }

});

// GEO json found @ http://grokbase.com/t/gg/d3-js/1372gq18j9/geojson-maps
//---------------- loading Europa data ----------------------

function loadJson() {
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
                var dataValue = parseInt(dataSeriesCountry[i].value);

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
            generateAttacks();
            generateTimeline();
        }
    });
}

//---------------- Legends Functionality ----------------------

var legendDensityTop = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .title("Number of attacks from 1970 - 2016")
    .titleWidth(200)
    .scale(colorsCountry);


var legendOrganisationTop = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .title("Organisations")
    .titleWidth(200)
    .scale(colorsGroup);

var legendAttackTypeTop = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .title("Attack Types")
    .titleWidth(200)
    .scale(colorsAttackType);

function drawLegendTop(legendToDraw) {
	// Create legend
    svgLegend.append("g")
        .attr("id", "legendTop")
        .attr("class", "legend")
        .attr("transform", "translate(0, 20)");

    svgLegend.select(".legend")
        .call(legendToDraw);
}

//---------------- Generate choropleth ----------------------
var generateChoropleth = function(){

    pDescription = d3.select("#choro")
        .append("div")
        .attr("class", "container")
        .append("p")
        .attr("id", "choroDescrip");

    pDescription.html(descriptionTab1);

	// Create SVG for choropleth
	svgChoropleth = d3.select("#choro").append("svg").attr("width", 850).attr("height", 800).attr("id", "choropleth");

    svgLegend = d3.select("#choro").append("svg").attr("width", 355).attr("height", 800).attr("id", "svgLegend");

	// Use projection on path to get propper wrapping of the lon/lat
	projection = d3.geoAzimuthalEqualArea()
						.center([20, 55])
						.scale(900)
						.translate([850/2, hChoro/2]);

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


function highlightTimeLine() {

    if (d3.event.selection != null) {

        var brush_selection = d3.brushSelection(brushTimeLineGroup.node());

        circles.filter(function(d) {

            var date = new Date(this.__data__.Date);
            return !(compareHourAndDate(brush_selection, date, d));

        })
            .classed("hidden", true)
            .classed("visible", false);

        circles.filter(function(d) {

            var date = new Date(this.__data__.Date);
            return compareHourAndDate(brush_selection, date, d);

        })
            .classed("visible", true)
            .classed("hidden", false);
    }

}

function compareHourAndDate(timeline_selection, date, d){
    var x0 = timeline_selection[0];
    var x1 = timeline_selection[1];

    return xScaleTimeline.invert(x0) <= date && date <= xScaleTimeline.invert(x1);

}

// Consider to recal
function brushEnd() {

    highlightTimeLine();

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

}

var brushTimeline = d3.brushX()
    .extent([[xScaleTimeline.range()[0], yScaleTimeLine.range()[1]], [xScaleTimeline.range()[1], yScaleTimeLine.range()[0]]])
    .on("end", brushEnd);

//---------------- Generate timeline ------------------------
var generateTimeline = function() {
    svgTimeLine = d3.select("#timeline").append("svg").attr("width", wSvgTimeLine).attr("height", hSvgTimeLine).attr("id", "timeline");

    dataSeriesAttacksPerDay = d3.nest()
        .key(function(d) { return d.Date; })
        .rollup(function(v) { return v.length; })
        .entries(terrorDataSet);

    xScaleTimeline.domain([
        d3.min(dataSeriesAttacksPerDay, function(d) { return new Date(d.key) }),
        d3.max(dataSeriesAttacksPerDay, function(d) { return new Date(d.key) })
    ]);

    yScaleTimeLine.domain([
    	0,
        d3.max(dataSeriesAttacksPerDay, function(d) { return d.value })
	]);

    pathGroup = svgTimeLine.append("g");
    brushTimeLineGroup = svgTimeLine.append("g");

    tlLine = pathGroup.append("path");
    tlXaxis = svgTimeLine.append("g");
    tlYaxis = svgTimeLine.append("g");
    tlXaxisText = svgTimeLine.append("text");
    tlYaxisText = svgTimeLine.append("text");

};

updateTimeLine = function() {

    var line = d3.line()
        .x(function (d) { return xScaleTimeline(new Date(d.key)); })
        .y(function(d) { return yScaleTimeLine(d.value); });

    tlLine.datum(dataSeriesAttacksPerDay)
        .attr("class", "line")
        .attr("d", line);

    // Call d3.brush and set it to work on this group
    brushTimeLineGroup.call(brushTimeline);

    // Draw x-axis included values along the axis.
	tlXaxis.attr("class", "axis xaxis")
        .attr("transform", "translate(0," + (hSvgTimeLine - padding) + ")")
        .call(xAxisTimeline);

    // Draw y-axis included values along the axis.
    tlYaxis.attr("class", "axis yaxis")
        .attr("transform", "translate(" + (padding) + ",0)")
        .call(yAxisTimeline);

    // Adding text to the y-axis
    tlYaxisText.attr("transform", "rotate(-90)")
        .attr("x", 0 - (hSvgTimeLine / 2))
        .attr("y", 0 )
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of attacks")
        .attr("class", "yAxisLabel");

    // Adding text to the x-axis
    tlXaxisText.attr("x", (wSvgTimeLine/2))
        .attr("y", (hSvgTimeLine - padding + 10))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Day")
        .attr("class", "xAxisLabel");

    brushTimeLineGroup.call(brushTimeline.move, [xScaleTimeline(new Date("01/01/2014")), xScaleTimeline(new Date("01/01/2016"))]);

};


//---------------- Visualizing terror attacks ----------------------
var generateAttacks = function() {
    // Adding circles for attacks
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
    tooltipCircles = circles.append("title");
};

//---------------- Tooltip Functionality ----------------------
var addTooltip = function(textFunction) {
    tooltipCircles.text(textFunction);
};

var colorCirclesGroup = function() {
	circles.style("fill", function(d){

        var groupName = d.Group;

        if (keysGroup.includes(groupName)) {
            return colorsGroup(groupName);
        } else {
            return colorsGroup("Others");
        }
    });
};

var colorCirclesAttackType = function() {
    circles.style("fill", function(d){

        var attackType = d.AttackType;

        if (keysAttackType.includes(attackType)) {
            return colorsAttackType(attackType);
        }
    });
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

var hideTimeLine = function() {

    document.getElementById('timeline').hidden = true;

};

var showTimeLine = function() {

    document.getElementById('timeline').hidden = false;

};

//---------------- Text In SVG Functionality ----------------------
var addTextBottom = function(description) {

    pDescription.html(description);

};

//---------------- Functions for drawing each of the three tabs ----------------------
var drawChoroplethTab1 = function() {

	// What to hide.
	hideCircles();
    hideAreaChart();
    hideTimeLine();

	// What to show.
	showDensityColours();
    drawLegendTop(legendDensityTop);
    addTextBottom(descriptionTab1);

};

var drawChoroplethTab2 = function() {

    // What to hide.
	hideDensityColours();
	hideAreaChart();

    // What to show.
    showCircles(2, true);
    drawLegendTop(legendOrganisationTop);
    addTooltip(function(d) {
        var groupName = d.Group;
        if (keysGroup.includes(groupName)) {
            return "";
        } else {
            return "Group: " + groupName
        }
    });
    updateTimeLine();
	showTimeLine();
    addTextBottom(descriptionTab2);

};

var drawChoroplethTab3 = function() {

    // What to hide.
    hideDensityColours();
    hideTimeLine();

    // What to show.
	showCircles(function (d) {
        return Math.sqrt(d.Killed);
    }, false);
    drawLegendTop(legendAttackTypeTop);
	showAreaChart();
	addTooltip(function(d) {
	    return "Date: " + d.Date + "\nCasualties: "+  d.Killed + "\nAttack Type: " + d.AttackType;
	});
    addTextBottom(descriptionTab3);

};
