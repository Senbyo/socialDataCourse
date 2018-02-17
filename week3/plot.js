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

var dataset;
var w = 504;
var h = 314;
var padding = 30;
var series
var dataIntermediate

var test = [
{ apples: 5, oranges: 10, grapes: 22 },
{ apples: 4, oranges: 12, grapes: 28 },
{ apples: 2, oranges: 19, grapes: 32 },
{ apples: 7, oranges: 23, grapes: 35 },
{ apples: 23, oranges: 17, grapes: 43 }
];

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

		var stack = d3.stack()
				.keys(["0", "1", "2", "3"]);

		series = stack(dataset)

		generateVisualization()


	}
});




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


