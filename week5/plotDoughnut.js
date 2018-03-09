
var rowConverter = function(d) {
     return {
          borough: d.BORO_NM,
          fotc: parseFloat(d.FoTC)  // FoTC = Fraction of Total Crime
     }
}

var dataset;

// Width and height
var w = 700;
var h = 300;
var r = 300;
var outerRadius = r / 2;
var innerRadius = r / 4;

//  Doughnut specific variables
var arc = d3.arc()
               .innerRadius(innerRadius)
               .outerRadius(outerRadius);
var pie = d3.pie()
               .value(function(d) {
                    return d.fotc;
               });

var color = d3.scaleOrdinal(d3.schemeCategory10);

// Legend variables
var legendStart = 150;
var legendHeight = 100;
var legendRectSize = 10;
var legendItems = [
    {color: 3, name:"" },
    {color: 2, name:"Fresh Vegetable" },
    {color: 1, name:"Storage Fruit" },
    {color: 0, name:"Storage Vegetable"}]

var csvFileName = "processedDoughnut.csv";
var svg;

// Load data file and generate visualization
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
     svg = d3.select("#plotDoughnut")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);

     console.log(pie(dataset));

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
               //return dataset[i].borough                      // Label bar chart with borough
               return Math.round(d.value * 1000) / 10 + "%";    // Label bar chart with fraction.
          });

    generateLegend()
};

var generateLegend = function() {

    var padding = 20
    var legx = outerRadius + padding

    // again rebind for legend
    var legendG = svg.selectAll(".legend") // note appending it to mySvg and not svg to make positioning easier
        .data(pie(dataset))
        .enter().append("g")
        .attr("transform", function(d,i){
            return "translate(" + (w - 135) + "," + (i * 15 + 20) + ")"; // place each legend on the right and bump each one down 15 pixels
        })
        .attr("class", "legend");

    legendG.append("rect") // make a matching color rect
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", function(d, i) {
            return color(i);
        });

    legendG.append("text") // add the text
        .text(function(d){
            return d.data.borough;
        })
        .style("font-size", 12)
        .attr("y", 10)
        .attr("x", 11);

};