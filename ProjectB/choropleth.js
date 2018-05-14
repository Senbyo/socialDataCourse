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
var tooltipCountry;

var topGroups = [];
var keysGroup = ["Others"];
var keysAttackType = [];

var pDescription;
var svgChoropleth;
var svgLegend;
var svgTimeLine;

var wSvgChoro = 850;
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
                                    '#a6cee3',
                                    '#1f78b4',
                                    '#b2df8a',
                                    '#33a02c',
                                    '#fb9a99',
                                    '#e31a1c',
                                    '#fdbf6f',
                                    '#ff7f00',
                                    '#cab2d6',
                                    '#6a3d9a',
                                    '#ffff99']);

var colorsAttackType = d3.scaleOrdinal()
                            .range(['#d53e4f',
                                    '#f46d43',
                                    '#fdae61',
                                    '#fee08b',
                                    '#ffffbf',
                                    '#e6f598',
                                    '#abdda4',
                                    '#66c2a5',
                                    '#3288bd']);

// Descriptions for tabs
var descriptionTab1 = "The continent of Europe (not to be confused with the Union) is illustrated below.</br> "+
    "Different colors represent the total number of attacks for each country for the period from 1970 to 2016.</br>" +
    "Hovering over a country will reveal its name.</br>" +
    "Click on the <i>Organisations</i> tab to continue with a more in-depth exploration.";
var descriptionTab2 = "An overview of every terror attack committed within a pre-selected time period can be found below. " +
    "You may interact with the timeline below the map to adjust the time period. The selection is versatile and can be " +
    "adjusted and dragged to fit any time period. Release the brush to update the map. The 11 most active groups have " +
    "been explicitly coloured and the remaining groups are coloured as <i>Others</i>.</br>" +
    "Hovering over an attack performed by <i>Others</i> will display a tooltip showing the specific group responsible " +
    "for that attack.</br>" +
    "Click on the <i>Attacks</i> tab to continue with a more in-depth exploration.";
var descriptionTab3 = "The illustrations below focus on the evolution of the type of attacks in time. Every attack since " +
    "the 1970s is shown on the map, with circle size being relative to the severity of the attack in human casualties.</br>" +
    "Hovering over an attack will reveal the name of the group responsible, the number of casualties, the type of attack " +
    "and a summary of the event when available.</br>" +
    "The illustration at the bottom of this page presents the number of attacks per attack type each year. Notice that " +
    "the coloring corresponds to that of the map. Hovering over a colored area in the bottom plot will reveal the attack " +
    "type it represents. Clicking on such an area will single it out for closer inspection. Clicking again will reveal " +
    "the relativistic usage of that type of attack by each of the eleven most deadly terror groups. The morbid " +
    "contribution of each group follows the same color coding as the <i>Organisations</i> tab.</br>"+
    "Press Back to reverse the selection process.";

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
var path;
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
	path = d3.geoPath()
				.projection(projection);

	// Draw path
	var countries = svgChoropleth.selectAll("path")
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

    tooltipCountry = countries.append("title");

    tooltipCountry.text(function (d) {
        return d.properties.sovereignt;
    });

    // adding zoom and pan stuff
    createPan();
    createZoom();
    hideZoomAndPan();

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

//---------------- Zoom and Pan ----------------------
var createPan = function() {
    var north = svgChoropleth.append("g")
        .attr("class", "pan")
        .attr("id", "north");

    north.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", wSvgChoro)
        .attr("height", 30);


    north.append("text")
        .attr("x", wSvgChoro/2)
        .attr("y", 20)
        .html("&uarr;")

    var south = svgChoropleth.append("g")
        .attr("class", "pan")
        .attr("id", "south");

    south.append("rect")
        .attr("x", 0)
        .attr("y", hSvgChoro- 30)
        .attr("width", wSvgChoro)
        .attr("height", 30);


    south.append("text")
        .attr("x", wSvgChoro/2)
        .attr("y", hSvgChoro - 10)
        .html("&darr;")

    var east = svgChoropleth.append("g")
        .attr("class", "pan")
        .attr("id", "east");

    east.append("rect")
        .attr("x", wSvgChoro - 30)
        .attr("y", 30)
        .attr("width", 30)
        .attr("height", hSvgChoro - 60);

    south.append("text")
        .attr("x", wSvgChoro - 20)
        .attr("y", hSvgChoro/2)
        .html("&rarr;")

    var west = svgChoropleth.append("g")
        .attr("class", "pan")
        .attr("id", "west");

    west.append("rect")
        .attr("x", 0)
        .attr("y", 30)
        .attr("width", 30)
        .attr("height", hSvgChoro - 60);

    west.append("text")
        .attr("x", 15)
        .attr("y", hSvgChoro/2)
        .html("&larr;")

    d3.selectAll(".pan")
        .on("click", function() {

            var x = 0;
            var y = 0;
            var moveAmount = 100;

            var direction = d3.select(this).attr("id");

            switch (direction) {
                case "north":
                    y += moveAmount; // increase y offset
                    break;

                case "south":
                    y -= moveAmount; // decrese y offset
                    break;

                case "east":
                    x -= moveAmount; // increase x offset
                    break;

                case "west":
                    x += moveAmount; // decrease x offset
                    break;

                default:
                    break;

            }

            //This triggers a zoom event, translating by x, y
            map.transition()
                .call(zoom.translateBy, x, y);
});
}

var createZoom = function() {

    var zoomIn = svgChoropleth.append("g")
        .attr("class", "zoom")
        .attr("id", "in")
        .attr("transform", "translate(" +( wSvgChoro - 105) + "," + (hSvgChoro - 70) + ")");

    zoomIn.append("rect")
        .attr("class", "unclickable")
        .attr("opacity", 0)
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", 30)
        .attr("height", 30);

    zoomIn.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .text("+");

    var zoomOut = svgChoropleth.append("g")
        .attr("class", "zoom")
        .attr("id", "out")
        .attr("transform", "translate(" +( wSvgChoro - 70) + "," + (hSvgChoro - 70) + ")");

    zoomOut.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("width", 30)
        .attr("height", 30);

    zoomOut.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .text("-");

    d3.selectAll(".zoom")
        .on("click", function(){

            var scaleFactor = 0;

            var direction = d3.select(this).attr("id");

            switch (direction) {
                case "in":
                    scaleFactor = 1.5; // increase y offset
                    break;

                case "out":
                    scaleFactor = 0.75; // decrese y offset
                    break;

                default:
                    break;

            }
            map.transition()
                .call(zoom.scaleBy, scaleFactor);
        })
}

var zooming = function(d) {
    var offset = [d3.event.transform.x, d3.event.transform.y];

    var newScale = d3.event.transform.k * 2000;

    projection
        .translate(offset)
        .scale(newScale);

    svgChoropleth.selectAll("path")
        .attr("d", path)

    svgChoropleth.selectAll("circle")
    .attr("cx", function(d) {
        return projection([d.Longitude, d.Latitude])[0];
    })
    .attr("cy", function(d) {
        return projection([d.Longitude, d.Latitude])[1];
    });

}

var showZoomAndPan = function(){
    d3.selectAll(".zoom")
        .classed("unclickable", false)
        .attr("opacity", 1);

    d3.selectAll(".pan")
        .classed("unclickable", false)
        .attr("opacity", 1);

}


var hideZoomAndPan = function(){
    d3.selectAll(".zoom")
        .classed("unclickable", true)
        .attr("opacity", 0);

    d3.selectAll(".pan")
        .classed("unclickable", true)
        .attr("opacity", 0);

}

var zoom =  d3.zoom()
         .on("zoom", zooming);
var map;


//---------------- Tooltip Functionality ----------------------
var addTooltip = function(tooltipElement, textFunction) {
    tooltipElement.text(textFunction);
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
    hideZoomAndPan();

	// What to show.
	showDensityColours();
    drawLegendTop(legendDensityTop);
    addTextBottom(descriptionTab1);
    addTooltip(tooltipCountry, function (d) {
        return d.properties.sovereignt;
    })
};

var drawChoroplethTab2 = function() {

    // What to hide.
	hideDensityColours();
	hideAreaChart();
    hideZoomAndPan();

    // What to show.
    showCircles(2, true);
    drawLegendTop(legendOrganisationTop);
    addTooltip(tooltipCircles, function(d) {
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
    addTooltip(tooltipCountry, "");

};

var drawChoroplethTab3 = function() {

    // What to hide.
    hideDensityColours();
    hideTimeLine();

    // What to show.
    map = svgChoropleth.append("g")
        .attr("id", "map")
        .call(zoom)  //Bind the zoom behavior
        .call(zoom.transform, d3.zoomIdentity
            .translate(wSvgChoro/2, hSvgChoro/2)
            .scale(0.45)
            .translate(20, 55));

    /*
    //Create a new, invisible background rect to catch drag events
    map.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", wSvgChoro)
        .attr("height", hSvgChoro)
        .attr("opacity", 0);
    */
	showCircles(function (d) {
        return Math.sqrt(d.Killed) + 2;
    }, false);
    drawLegendTop(legendAttackTypeTop);
	showAreaChart();

    addTooltip(tooltipCircles, function(d) {
	    return "Group: " + d.Group + "\nCasualties: "+  d.Killed + "\nAttack Type: " + d.AttackType + "\nSummary: " + d.Summary;
	});

    showZoomAndPan();
    addTooltip(tooltipCountry, function (d) {
        return "";
    });
    addTextBottom(descriptionTab3);

};
