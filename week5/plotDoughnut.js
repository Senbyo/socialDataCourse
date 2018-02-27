
var rowConverter = function(d) {
     return {
          borough: d.BORO_NM,
          fotc: parseFloat(d.FoTC)  // FoTC = Fraction of Total Crime
     }
}

var dataset;

//Width and height
var w = 500;
var h = 300;
var r = 300
var outerRadius = r / 2;
var innerRadius = r / 4;
var arc = d3.arc()
               .innerRadius(innerRadius)
               .outerRadius(outerRadius);
var pie = d3.pie()
               .sort(null)
               .value(function(d) {
                    return d.fotc;
               });
var color = d3.scaleOrdinal(d3.schemeCategory10);


var csvFileName = "processedDoughnut.csv"

d3.csv(csvFileName, rowConverter, function(error, data){

	if (error) {
		console.log(error);
	} else {

          dataset = data;

		generateVisualization()

	}
});

var generateVisualization = function() {

     //Create SVG element
     var svg = d3.select("#plotDoughnut")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);

     console.log(pie(dataset))

     //Set up groups
     var arcs = svg.selectAll("g.arc")
                      .data(pie(dataset))
                      .enter()
                      .append("g")
                      .attr("class", "arc")
                      .attr("transform", "translate(" + w/2 + "," + h/2 + ")");

     //Draw arc paths
     arcs.append("path")
          .attr("fill", function(d, i) {
               return color(i);
          })
          .attr("d", arc);

     //Labels
     arcs.append("text")
          .attr("transform", function(d) {
               return "translate(" + arc.centroid(d) + ")";
          })
          .attr("text-anchor", "middle")
          .text(function(d, i) {
               //return dataset[i].borough   // Label bar chart with borough
               return Math.round(d.value * 100) + "%";               // Label bar chart with fraction.
          });
}
