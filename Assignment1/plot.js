var rowConverter = function(d) {
		return {
				Index: parseInt(d.Index),
				Month: d.Month,
				Count: parseInt(d.Count)
			}
}

// Global variables.
var dataset;
var w = 504;
var h = 314;
// Added a width for the bar chart to leave room for the legend
var scalepadding = 3;
var barchartWidth = 404;
var padding = 40;
var horizontalPadding = 40;
var legendStart = 150;
var legendHeight = 100;
var legendRectSize = 10;
var legendItems = [
					{color: 3, name:"Fresh Fruit" },
					{color: 2, name:"Fresh Vegetable" },
					{color: 1, name:"Storage Fruit" },
					{color: 0, name:"Storage Vegetable"}]
var lineGroup
//Changed colors to reflect the other graph
//var colors = d3.schemeCategory20;


var lineInterval = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

var xAxisVal = d3.scaleBand()
				.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
				.range([padding, barchartWidth - padding])
				.paddingInner(0.5);

var xScale = d3.scaleBand()
				.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
				.range([padding, barchartWidth - padding])
				.paddingInner(0.5);

var yScale = d3.scaleLinear()
			.domain([0, 50])
			.range([h- padding, padding]);

var legendScale = d3.scaleBand()
				.domain(["Fresh Fruit", "Fresh Vegetable", "Storage Fruit", "Storage Vegetable"])
				.range([legendStart, legendStart + legendHeight])

var lineOffset= 1

var xAxis = d3.axisBottom(xAxisVal)
var yAxis = d3.axisLeft(yScale);

var svgPlot
var lines
var rects
var groups
var yaxis
var keys = [3, 1, 2, 0]
var singleGroups = [ 0, 2, 1, 3]
var colors = ["beige", "salmon", "green", "red"]
var stacked = true;

d3.csv("data.csv", rowConverter, function(error, data){

	if (error) {
		console.log(error);
	} else {
		//console.log(data)
		dataset = data;

		series = convertToStack(dataset, keys)
		//console.log(series)
		generateVisualization()
		generateBars()

	}
});

// convertToStack will transform the dataset into a stack, which is suitable
// for creating stacked bar charts.
// Index 0 = Fresh Fruit (Colour: Red)
// Index 1 = Storage Fruit (Colour: Salmon)
// Index 2 = Fresh Vegetables (Colour: Green)
// Index 3 = Storage Vegetables (Colour: Olive)
var convertToStack = function(dataset, keys) {

	// Create an empty two dimensional array
	var array = [];
	for(var i = 0; i < dataset.length/4; i++){
    		array[i] = [];
	}

	// Run through data set and add the values to the two dimensional array.
	// arr[0][x] corresponds to Jan, arr[1][x] corresponds to Feb and so on.
	var months = 12
	for (i = 0; i < dataset.length; i++) {
		array[i % months].push(dataset[i].Count)
	}

	// Run through the two dimensional array and create objects corresponding
	// to the months.
	var convertedData = []
	for (i = 0; i < array.length; i++) {
		var fFruit = array[i][0]
		var sFruit = array[i][1]
		var fVegetable = array[i][2]
		var sVegetable = array[i][3]

		var record = {0: fFruit, 1: sFruit, 2: fVegetable, 3: sVegetable}
		convertedData.push(record)
	}

	// The order if the keys is a bit peculiar but it is to get the data
	// stacked correctly.
	var stack = d3.stack()
				.keys(keys);
	return stack(convertedData)

};

var changeGraph = function(groupNumber) {

	var maxVal = d3.max(dataset, function(d){
			if (d.Index == groupNumber) {
	    		return d.Count };
			});

	rescale(maxVal + scalepadding);

	moveBackgroundbars()

	rects.transition()
		.attr("y", function(d){
			return h - padding;
		})
		.attr("height", 0);

	rects.transition()
		.attr("x", function(d, i) {
			return xScale(i);
		})
		.delay(function(d, i) {
			return 500 + i * 10;
		})
		.attr("width", xScale.bandwidth())
		.attr("y", function(d) {
			if (this.parentNode.__data__.key == groupNumber){
				return  yScale(d[1]- d[0]);
			} else {
				return 0;
			}
		})
		.attr("height", function(d) {
			if (this.parentNode.__data__.key == groupNumber){
				return h - padding - yScale(d[1]- d[0]);
			} else {
				return 0;
			}
		});


        stacked = false;

}


var rescale = function(scaleMax) {
	    yScale.domain([0, scaleMax]);
	    yaxis.transition().duration(1500)
		.ease(d3.easeQuadIn)
		    .call(yAxis);
	        }


var stackedAndGrouped = function(color) {

	if (stacked) {

		rescale(d3.max(dataset, function(d){
	    	return d.Count }) + scalepadding);

		moveBackgroundbars()

		rects.transition()
		.duration(500)
		.attr("width", xScale.bandwidth() / 4)
		.attr("x", function(d, i) {
			return xScale(i) + (xScale.bandwidth() / 4) * this.parentNode.__data__.key;
		})
		.transition()
		.attr("y", function(d) {
			return  yScale(d[1]- d[0]);
		})
		.attr("height", function(d) {
			return h - padding - yScale(d[1]- d[0]);
		})


		stacked = false;

	}
	else {

		var maxVal = d3.max(series, function(d){
			return d3.max(d, function(d){
				return d[1];
			});
		});

		rescale(maxVal + scalepadding + 3)



		rects.transition()
			.attr("height", 0)
			.delay(function(d, i){
				return 500 + 10 * i;
			})
			.attr("y", function(d){
				return h - padding;
			})

		rects.transition()
			.delay(500)
			.attr("width", xScale.bandwidth())
			.attr("y", function(d) {
				return yScale(d[1]);
			})
			.transition()
			.attr("x", function(d, i) {
				return xScale(i);
			})
		.attr("height", function(d) {
			return yScale(d[0]) - yScale(d[1]);
		});

		stacked = true;

		moveBackgroundbars()
	}
}

var generateVisualization = function() {
	svgPlot = d3.select("#plot").append("svg").attr("width", w).attr("height", h);

	svgPlot.append("rect")
			.attr("width", w)
			.attr("height", h)
			.attr("fill", "none")
			.attr("x", 0)
			.attr("y", 0)
			.attr("stroke", "gray")
			.attr("stroke-width", "3")
			.attr("stroke-opacity", "0.5")

	lineGroup = svgPlot.append("g")
			.attr("x", barchartWidth - horizontalPadding )
			.attr("y", 0)

	lines = lineGroup.selectAll("line")
		.data(lineInterval)
		.enter()
		.append("line")
		.attr("x1", function(d){
			return padding
		})
		.attr("y1", function(d){
			return yScale(d)
		})
		.attr("x2", function(d){
			return barchartWidth - padding
		})
		.attr("y2", function(d){
			return yScale(d)
		})
		.attr("stroke", "gray")
		.attr("stroke-width", "2")
		.attr("stroke-opacity", "0.5");

	// Add a group for each row of data
	groups = svgPlot.selectAll()
		.data(series)
		.enter()
		.append("g")
		.style("fill", function(d, i) {
			return colors[i];
		})
		.attr("class", function(d, i){
			return "rectGrp" + i;
		});

	// Adding the legend as a group so that it can contain text
	var legend = svgPlot.append("g")
			.attr("x", barchartWidth - horizontalPadding )
			.attr("y", 0)

	// Adding the rects
	legend.selectAll("rect")
			.data(legendItems)
			.enter()
			.append("rect")
			.attr("width", legendRectSize)
			.attr("height", legendRectSize)
			.attr("fill", function(d){
				return colors[d.color]
			})
			.attr("x", function(d) {
				return barchartWidth-legendRectSize;
			})
			.attr("y", function(d) {
				return legendScale(d.name)-legendRectSize;
			})
			.attr("class", "button back")
			.on("click", function(d, i) {
				changeGraph(singleGroups[i])
			});

	// Adding the text
	// formatting is in css
	legend.selectAll("text")
			.data(legendItems)
			.enter()
			.append("text")
			.text(function(d){
				return d.name;
			})
			.attr("x", function(d) {
				return barchartWidth + 2;
			})
			.attr("y", function(d) {
				return legendScale(d.name);
			})
			.attr("class", "Legend");

	var plotText = svgPlot.append("g")
			.attr("x", barchartWidth - horizontalPadding )
			.attr("y", 0);

	var plotText = svgPlot.append("g")
			.attr("x", barchartWidth - horizontalPadding )
			.attr("y", 0)

	// Draw x-axis included values along the axis.
	svgPlot.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);

	// Draw y-axis included values along the axis.
	yaxis = svgPlot.append("g")
		.attr("class", "axis yaxis")
		.attr("transform", "translate(" + (padding ) + ",0)")
		.call(yAxis);

	// Adding text to the y-axis
  	svgPlot.append("text")
     	.attr("transform", "rotate(-90)")
     	.attr("x", 0 - (h / 2))
     	.attr("y", 0 )
     	.attr("dy", "1em")
     	.style("text-anchor", "middle")
     	.text("# of Unique Kinds of Produce")
     	.attr("class", "yAxisLabel")

  	svgPlot.append("text")
      	.attr("transform",
            "translate(" + (w/2) + " ," +
                           (0) + ")")
     	.attr("dy", "1em")
     	.style("text-anchor", "middle")
     	.text("NYC Green Markets - Unique Produce Types")
     	.attr("class", "xAxisLabel")
		.on("mouseout", function() {
				stackedAndGrouped([3, 2, 1, 0])
				//moveBackgroundbars()
			});
}

var moveBackgroundbars = function() {

	// Draw horisontal lines, that strecthes over the entire plot.

	console.log(yScale.ticks());
	lineInterval = yScale.ticks();

	var selection = lineGroup.selectAll("line").data(lineInterval);

	console.log(selection)

	selection.enter()
		.append("line")
		.attr("x1", function(d){
			return padding
		})
		.attr("y1", function(d){
			return 0;
		})
		.attr("x2", function(d){
			return barchartWidth - padding
		})
		.attr("y2", function(d){
			return 0;
		})
		.attr("stroke", "gray")
		.attr("stroke-width", "2")
		.attr("stroke-opacity", "0.5")
		.transition()
		.duration(1500)
		.ease(d3.easeQuadIn)
		.attr("y1", function(d){
			return yScale(d)
		})
		.attr("y2", function(d){
			return yScale(d)
		});

	selection.exit()
		.transition()
		.duration(1500)
		.ease(d3.easeQuadIn)
		.attr("y1", -50)
		.attr("y2", -50)
		.remove();

	selection.transition()
		.duration(1500)
		.ease(d3.easeQuadIn)
		.attr("x1", function(d){
			return padding
		})
		.attr("y1", function(d){
			return yScale(d)
		})
		.attr("x2", function(d){
			return barchartWidth - padding
		})
		.attr("y2", function(d){
			return yScale(d)
		});
}

var generateBars = function() {

	// Add a rect for each data value
	rects = groups.selectAll("rect")
		.data(function(d) {
			return d;
		})
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
			return xScale(i);
		})
		.attr("y", function(d) {
			return yScale(d[1]);
		})
		.attr("height", function(d) {
			return yScale(d[0]) - yScale(d[1]);
		})
		.attr("width", xScale.bandwidth());
}
