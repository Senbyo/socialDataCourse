//---------------- Global variables ----------------------
var dataset;
var dataSeries;
var svgStackedArea;
var choroplethWidth = 800;
var choroplethHeight = 800;
var w = 800;
var h = 800;
var colors = d3.scaleQuantize()
				.domain([0,69])
				.range(["rgb(188,189,220)",
						"rgb(158,154,200)",
						"rgb(128,125,186)",
						"rgb(106,81,163)",
						"rgb(84,39,143)",
						"rgb(63,0,125)"]);


//---------------- row converter ----------------------
var rowConverter = function(d) {
		return {
				Date: new Date(d.Date),
				Country: d.Country,
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

//---------------- loading murder data ----------------------
d3.csv("data/terror_EU_processed_data.csv", rowConverter, function(error, data){

	if (error) {
		console.log(error);
	} else {
		//console.log(data);
		dataset = data;

		console.log(Object.keys(dataset[0]));

		// Grab keys from the data set used for stacking
		dataSeries = d3.nest()
		  .key(function(d) { return d.Year ; }).entries(dataset)

		  //.rollup(function(v) { return v.length; })
		  //.entries(data);
		//var keys = ["Bombing/Explosion", "Hijacking", "Infrastructure Attack", "Armed Assult", "Kidnapping", "Unarmed Assult", "Assassination", "Unknown", "Hostage Taking"];
		var keys = Object.keys(dataset[0])
		console.log(dataSeries)

		var stack = d3.stack()

		stack.keys(["Group", "AttackType"]);

		//	.value(function value(d, key) {
		//	return d.Year;
		//});
		
		console.log(stack(dataSeries))

		generateAreaChart();

	}
});


//---------------- Generate Stacked Area chart ----------------------
var generateAreaChart = function(){

}