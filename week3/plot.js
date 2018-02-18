var rowConverter = function(d) {
	if (d.Index == 0) {
		return {
			"0" : d.Index,
			Month: d.Month,
			Count: parseInt(d.Count)
		};
	} if (d.Index == 1) {
		return {
			"1" : d.Index,
			Month: d.Month,
			Count: parseInt(d.Count)

		};
	} if (d.Index == 2) {
		return {
			"2" : d.Index,
			Month: d.Month,
			Count: parseInt(d.Count)

		};
	}
	return {
		"3" : d.Index,
		Month: d.Month,
		Count: parseInt(d.Count)

	};
}

// Global variables.
var dataset;
var w = 504;
var h = 314;
var padding = 30;
var series
var dataIntermediate

var lineInterval = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]

var xScale = d3.scaleBand()
				.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
				.range([padding, w - padding])
				.paddingInner(0.5);

var yScale = d3.scaleLinear()
			.domain([0, 50])
			.range([h- padding, padding]);

// Research or delete
var colorScale = d3.scaleBand()
					.range(["green", "green", "green", "green"])

var lineOffset= 1

var xAxis = d3.axisBottom(xScale)
			.ticks(13);
var yAxis = d3.axisLeft(yScale);
var colors = ["red", "green", "salmon", "grey"];

d3.csv("data.csv", rowConverter, function(error, data){

	if (error) {
		console.log(error);
	} else {
		console.log(data)
		dataset = data;

		series = convertToStack(dataset)

		generateVisualization()
		
	}
});


// convertToStack will transform the dataset into a stack, which is suitable
// for creating stacked bar charts.
// Index 0 = Fresh Fruit (Colour: Red)
// Index 1 = Storage Fruit (Colour: Salmon)
// Index 2 = Fresh Vegetables (Colour: Green)
// Index 3 = Storage Vegetables (Colour: Olive)
var convertToStack = function(dataset) {

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
				.keys([ 3, 1, 2, 0 ]);

	return stack(convertedData)

};



var generateVisualization = function() {
	var svgPlot = d3.select("#plot").append("svg").attr("width", w).attr("height", h);

	svgPlot.append("rect")
			.attr("width", w)
			.attr("height", h)
			.attr("fill", "none")
			.attr("x", 0)
			.attr("y", 0)
			.attr("stroke", "gray")
			.attr("stroke-width", "3")
			.attr("stroke-opacity", "0.5")

	svgPlot.selectAll("line")
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
			return w - padding
		})
		.attr("y2", function(d){
			return yScale(d)
		})
		.attr("stroke", "gray")
		.attr("stroke-width", "2")
		.attr("stroke-opacity", "0.5")

	svgPlot.selectAll()
			.data(dataset)
			.enter()
			.append("rect")
			.attr("x", function(d,i) {
				return xScale(d.Month);
			})
			.attr("y", function(d){
				return yScale(d.Count);
			})
			.attr("width", xScale.bandwidth())
			.attr("height", function(d){
				return h - padding - yScale(d.Count);
			})
			.attr("fill", function(d) {
				return colors[d.Index];
			})


	svgPlot.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);

	svgPlot.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + (padding ) + ",0)")
		.call(yAxis);

	var count = 0;
	//var xData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	var xData = [0,1,2,3]
	dataIntermediate = xData.map(function (c) {
	    return dataset.map(function (d) {
	    	array = []
	    	count += 1
			array.push(1)

	    	if (count % 3 == 0)
		        return {Month: d.Month, array};
	    });
	});
}
