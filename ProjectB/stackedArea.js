//---------------- Global variables ----------------------
var datasetArea;
var dataSeries;
var stackedTypeData;
var stackedGroupData;
var AllDataset;
var keys;
var stack;
var area;
var groupDataset = []
var svgStackedArea;
var wArea = 1200;
var hArea = 400;
var paddingArea = 50;
var colorsStackedArea = d3.scaleQuantize()
				.domain([0,69])
				.range(["rgb(188,189,220)",
						"rgb(158,154,200)",
						"rgb(128,125,186)",
						"rgb(106,81,163)",
						"rgb(84,39,143)",
						"rgb(63,0,125)"]);
var colors = ["rgb(188,189,220)",
				"rgb(158,154,200)",
				"rgb(128,125,186)",
				"rgb(106,81,163)",
				"rgb(84,39,143)",
				"rgb(63,0,125)"]

var xScaleArea = d3.scaleTime()
						.range([paddingArea, wArea - paddingArea]);


var yScaleArea = d3.scaleLinear()
						.domain([0, 1100])
						.range([hArea - paddingArea, paddingArea]);

var xAxisArea = d3.axisBottom(xScaleArea);
var yAxisArea = d3.axisLeft(yScaleArea);


//---------------- row converter ----------------------
var rowConverter = function(d) {
		return {
				Year: new Date(d.Year),
				Attacks: d.Attacks,
				Bombing: d.BombingExplosion,
				Assassination: d.Assassination,
				Armed_Assault: d.Armed_Assault,
				Infrastructure_Attack: d.Infrastructure_Attack,
				Kidnapping: d.Kidnapping,
				AttackType: d.AttackType,
				Unknown: d.Unknown,
				Unarmed_Assault: d.Unarmed_Assault,
				Hostage_Taking: d.Hostage_Taking,
				Hijacking: d.Hijacking,
				Group: d.Group
			}
};

//---------------- loading murder data ----------------------
d3.csv("data/data_breakdown_betterTransitions.csv", rowConverter, function(error, data){

	if (error) {
		console.log(error);
	} else {
		//console.log(data);
		datasetArea = data;

		console.log(datasetArea);
		// Grab keys from the data set used for stacking
		//dataSeries = d3.nest()
		//  .key(function(d) { return d.Bombing ; }).entries(datasetArea);

		  //.rollup(function(v) { return v.length; })
		  //.entries(data);
		keys = ["Bombing", "Hijacking", "Infrastructure_Attack", "Armed_Assault", "Kidnapping", "Unarmed_Assault", "Assassination", "Unknown", "Hostage_Taking"];
		//var groupkeys = ["Unknown", "Irish Republican Army (IRA)", "Extraparliamentary Opposition (APO)", "Popular Front for the Liberation of Palestine (PFLP)"]
		//var keys = ["Bombing", "Hijacking", "Infrastructure_Attack"];
		//var keys = Object.keys(datasetArea[0]);


		stack = d3.stack().order(d3.stackOrderDescending);
		stack_number_two = d3.stack().order(d3.stackOrderDescending);

		var attacksByGroup = d3.nest()
			.key(function(d) { return d.Group; })
			.entries(datasetArea);

		var AttacksTotal = d3.nest()
			.key(function(d) { return d.Year; })
			.key(function(d) { return d.Group; })
			.object(datasetArea);




		stack.keys(keys);
		groupKeys = []
		for (var i in attacksByGroup){
			groupKeys[i] =attacksByGroup[i].key;
		}

		stack_number_two.keys(groupKeys.slice(1))



		AllDataset = [];
		var count = 0;

		for (var i = 0; i < datasetArea.length; i++) {
			//Create a new object

			if (datasetArea[i].Group == "All") {
					AllDataset[count] = {
						Year: datasetArea[i].Year, 
						Group: datasetArea[i].Group,
						Bombing: datasetArea[i].Bombing,
						Hijacking: datasetArea[i].Hijacking,
						Infrastructure_Attack: datasetArea[i].Infrastructure_Attack,
						Armed_Assault: datasetArea[i].Armed_Assault,
						Kidnapping: datasetArea[i].Kidnapping,
						Unarmed_Assault: datasetArea[i].Unarmed_Assault,
						Assassination: datasetArea[i].Assassination,
						Unknown: datasetArea[i].Unknown,
						Hostage_Taking: datasetArea[i].Hostage_Taking,
						Attacks: datasetArea[i].Attacks
					};

					curObject = {};
					curObject["Year"] = datasetArea[i].Year;
					groupDataset[count] = curObject;
					count += 1;	
			}

		}

		console.log(AllDataset);



		for (objectID in groupDataset){
			//pad with all currently used groups
			for (var i= 0; i < groupKeys.length; i++) {
					groupDataset[objectID][groupKeys[i]] = 0;
				}

		}


		stackedTypeData = stack(AllDataset);
		stackedGroupData = stack_number_two(groupDataset);

		generateAreaChart();

	}
});
var unNest =  function(dataset){
	unNestedData = []
	for (row in dataset){
		curObject = {}
		var year = dataset[row].key
		curObject["Year"] = new Date(year)
		//pad with all currently used groups
		for (var i= 0; i < groupKeys.length; i++) {
			curObject[groupKeys[i]] = 0;

		};

		for (var i= 0; i < dataset[row].values.length; i++) {
			curObject[dataset[row].values[i].key] = dataset[row].values[i].value;

		};
		unNestedData.push(curObject)
	}

	return unNestedData;
}


//---------------- Generate Stacked Area chart ----------------------
var generateAreaChart = function(){


	svgStackedArea = d3.select("#area").append("svg").attr("width", wArea).attr("height", hArea);

	xScaleArea.domain([
		d3.min(datasetArea, function(d) { return d.Year; }),
		d3.max(datasetArea, function(d) { return d.Year; })
		]);
	

	var area = d3.area()
	    .x(function(d) {
	     return xScaleArea(d.data.Year); })
	    .y0(function(d) { 
	    	console.log(yScaleArea(d[0]))
	    	return yScaleArea(d[0]); })
	    .y1(function(d) { return yScaleArea(d[1]); });

    //Create areas for groups
    svgStackedArea.append("g")
    	.attr("id", "StackGroups")
    	.selectAll("path")
    	.data(stackedGroupData)
    	.enter()
    	.append("path")
    	.attr("class", "area")
    	.attr("d", area)
		.attr("fill", function(d, i) {
			return d3.schemeCategory20[i];
		})
		.append("title")  //Make tooltip
		.text(function(d, i) {
			return d.key;
		});

	//Create areas for types
	svgStackedArea.append("g")
		.attr("id", "StackTypes")
		.selectAll("path")
		.data(stackedTypeData)
		.enter()
		.append("path")
		.attr("class", "area")
		.attr("d", area)
		// Make a complicated fill function that divides everything into stuff
		.attr("fill", function(d, i) {
			return d3.schemeCategory20[i];
		})
		.on("click", function(d) {
			
			//Which type was clicked?
			var thisType = d.key;

			// Generate a new dataset for the currently clicked key
			var thisTypeDataset = [];
			var count = 0
			var allDataSet = []
			var countAll = 0;
			for (var i = 0; i < datasetArea.length; i++) {

				//Create a new object
				if (datasetArea[i].Group != "All") {
					thisTypeDataset[count] = {
						Year: datasetArea[i].Year, 
						Group: datasetArea[i].Group,
						Bombing: 0,
						Hijacking: 0,
						Infrastructure_Attack: 0,
						Armed_Assult: 0,
						Kidnapping: 0,
						Unarmed_Assult: 0,
						Assassination: 0,
						Unknown: 0,
						Hostage_Taking: 0,
						[thisType]: parseInt(datasetArea[i][thisType])
					};
					count += 1;
				}
				if (datasetArea[i].Group == "All") {
					allDataSet[countAll] = {
						Year: datasetArea[i].Year, 
						Group: datasetArea[i].Group,
						Bombing: 0,
						Hijacking: 0,
						Infrastructure_Attack: 0,
						Armed_Assult: 0,
						Kidnapping: 0,
						Unarmed_Assult: 0,
						Assassination: 0,
						Unknown: 0,
						Hostage_Taking: 0,
						[thisType]: parseInt(datasetArea[i][thisType])
					};
					countAll += 1;
				}
			}
			//stack new data


			var nestedThisTypeDataset = d3.nest()
			  .key(function(d) { return d.Year; })
			  .key(function(d) { return d.Group; })
			  .rollup(function(v) { 
			  	return d3.sum(v, function(d) {
			  		return d[thisType]; 
			  	}); 
			  })
			  .entries(thisTypeDataset);

		  	var unnestedThisTypeDataset = unNest(nestedThisTypeDataset);

			var typeStackedData = stack_number_two(unnestedThisTypeDataset);
			var restackedTypeData = stack(allDataSet);

			console.log(typeStackedData);
			console.log(restackedTypeData);

			var pathsTypes = d3.selectAll("#StackTypes path")
								.data(restackedTypeData)
								.classed("unclickable", "true");

			var paths = d3.selectAll("#StackGroups path")
								.data(typeStackedData);

			var pathsTypesTransition = pathsTypes.transition()
				.duration(1000)
				.attr("d", area);
			
			var areaTransitions = paths.transition()
				.delay(800)
				.on("start", function() {
					//Make vehicles visible instantly, so 
					//they are revealed when this fades out
					//d3.selectAll("#StackTypes path")
					pathsTypes.transition(1000)
						.delay(500)
						.duration(1000)
						.attr("opacity", 0);
				})
				.attr("d", area);

			//Update scale
			yScaleArea.domain([
					0,
					d3.max(typeStackedData, function(d) {
						var sum = 0
						sum += parseInt(d[thisType]);

						return sum;
					})
				]);
			
			areaTransitions.transition()
				.delay(1500)
				.duration(1000)
				.attr("d", area);
			
			
			
		})
		.attr("opacity", 1)
		.append("title")  //Make tooltip
		.text(function(d) {
			return d.key;
		});

	// Draw x-axis included values along the axis.
	svgStackedArea.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (hArea - paddingArea) + ")")
		.call(xAxisArea);

	// Draw y-axis included values along the axis.
	svgStackedArea.append("g")
		.attr("class", "axis yaxis")
		.attr("transform", "translate(" + (paddingArea) + ",0)")
		.call(yAxisArea);

};