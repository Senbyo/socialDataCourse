// Global Variables

//Width and height
var w = 500;
var h = 300;

var svgNetwork;
var edges;
var nodes;

var colors = d3.scaleOrdinal(d3.schemeCategory10);

// Dataset from https://nbviewer.jupyter.org/github/suneman/socialdataanalysis2018/blob/master/lectures/Week5.ipynb
var dataset = { nodes: [ { name: "Manhattan" }, 
						 { name: "Brooklyn" },
						 { name: "Queens" },
						 { name: "The Bronx" },
						 { name: "Staten Island" } ],
				edges: [ { source: 0, target: 1 },
						 { source: 0, target: 2 },
						 { source: 0, target: 3 },
						 { source: 0, target: 4 },
						 { source: 1, target: 3 },
						 { source: 2, target: 3 },
						 { source: 2, target: 4 },
						 { source: 3, target: 4 }, ] }

// Interactive functions on nodes
function dragStarted(circle, d){
	if (!d3.event.active) force.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;

	d3.select(circle)
		.transition(200)
		.attr("r", 15);

	var circleName = d.name;

	edges.transition()
		.filter(function(d){
			return d.source.name == circleName || d.target.name == circleName;
		})
		.attr("stroke", "red");

}

function dragging(circle, d){
	d.fx = d3.event.x;
	d.fy = d3.event.y;

	var circleName = d.name;

	edges.filter(function(d){
			return d.source.name == circleName || d.target.name == circleName;
		})
		.attr("stroke-width", 1)
}

function dragEnded(circle, d){
	if (!d3.event.active) force.alphaTarget(0);
	d.fx = null;
	d.fy = null;

	d3.select(circle)
		.transition(200)
		.attr("r", 10);

	edges.transition(500)
		.attr("stroke", "black")
		.attr("stroke-width", 3)
}


svgNetwork = d3.select("#plotNetwork").append("svg").attr("width", w).attr("height", h);

// Graph border
svgNetwork.append("rect")
		.attr("width", w)
		.attr("height", h)
		.attr("x", 0)
		.attr("y", 0)
		.attr("fill", "none")
		.attr("stroke", "gray")
		.attr("stroke-width", "3pt")
		.attr("stroke-opacity", "0.5");

// Intitialize a simple force layout
// play around with forces
//
var force = d3.forceSimulation(dataset.nodes)
				.force("charge", d3.forceManyBody())
				.force("link", d3.forceLink(dataset.edges))
				.force("center", d3.forceCenter().x(w/2).y(h/2))
				.force("collide", d3.forceCollide(10));

// Create edges of the network
edges = svgNetwork.selectAll("line")
			.data(dataset.edges)
			.enter()
			.append("line")
			.attr("stroke", "black")
			.attr("stroke-width", 3);

// Create nodes for the network
nodes = svgNetwork.selectAll("circle")
			.data(dataset.nodes)
			.enter()
			.append("circle")
			.attr("r", 10)
			.style("fill", function(d, i){
				return colors(i);
			})
			.call(d3.drag()
			.on("start", function(d, i){
				dragStarted(this, d) })
			.on("drag", function(d, i){
				dragging(this, d) })
			.on("end",  function(d, i){
				dragEnded(this, d) }));

// Add tootip
nodes.append("title")
		.text(function(d){
			return d.name;
		});

// Make the actual simulation take place
force.on("tick", function(){

	edges.attr("x1", function(d) {
			return d.source.x;
		})
		.attr("y1", function(d) {
			return d.source.y;
		})
		.attr("x2", function(d) {
			return d.target.x;
		})
		.attr("y2", function(d) {
			return d.target.y;
		});

	nodes.attr("cx", function(d) {
			return d.x;
		})
		.attr("cy", function(d){
			return d.y;
		})

});