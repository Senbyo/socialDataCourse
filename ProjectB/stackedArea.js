//---------------- Global variables ----------------------
var datasetArea;
var stackedTypeData;
var stackedGroupData;
var AllDataset;
var keysArea;
var stack;
var typeStackedData;
var restackedTypeData;
var pathsTypes;
var pathsGroups;
var area;
var currentState = 0;
var yAxisGroup;
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

var colorsAttackTypeArea = d3.scaleOrdinal()
							.range(['#8c510a',
									'#bf812d',
									'#dfc27d',
									'#f6e8c3',
                                	'#f5f5f5',
									'#c7eae5',
									'#80cdc1',
									'#35978f',
									'#01665e']);

var xScaleArea = d3.scaleTime()
						.range([paddingArea, wArea - paddingArea]);


var yScaleArea = d3.scaleLinear()
						.domain([0, 1100])
						.range([hArea - paddingArea, paddingArea]);

var xAxisArea = d3.axisBottom(xScaleArea);
var yAxisArea = d3.axisLeft(yScaleArea);


//---------------- row converter ----------------------
var rowConverterArea = function(d) {
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
d3.csv("data/data_breakdown_betterTransitions.csv", rowConverterArea, function(error, data){

	if (error) {
		console.log(error);
	} else {
		//console.log(data);
		datasetArea = data;

		keysArea = ["Bombing", "Hijacking", "Infrastructure_Attack", "Armed_Assault", "Kidnapping", "Unarmed_Assault", "Assassination", "Unknown", "Hostage_Taking"];


		stack = d3.stack().order(d3.stackOrderDescending);
		stack_number_two = d3.stack().order(d3.stackOrderDescending);

		var attacksByGroup = d3.nest()
			.key(function(d) { return d.Group; })
			.entries(datasetArea);

		var AttacksTotal = d3.nest()
			.key(function(d) { return d.Year; })
			.key(function(d) { return d.Group; })
			.object(datasetArea);


		stack.keys(keysArea);
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

var rescale = function(scaleMax, duration, delay) {
	    yScaleArea.domain([0, scaleMax]);
	    yAxisGroup.transition("rescale animation")
	    	.delay(delay)
	    	.duration(duration)
			.ease(d3.easeQuadIn)
		    .call(yAxisArea);
	        }

var buttonVisibility = function() {
	var button = d3.select("#stackedAreaButton")

	if (button.classed("unclickable")){
		button.classed("unclickable", false)
		.transition()
		.duration(500)
		.attr("opacity", 1);	

	} else {
		button.classed("unclickable", true)
		.transition()
		.duration(500)
		.attr("opacity", 0);	

	}
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
	    .y0(function(d) { return yScaleArea(d[0]); })
	    .y1(function(d) { return yScaleArea(d[1]); });

    //Create areas for groups
    pathsGroups = svgStackedArea.append("g")
    	.attr("id", "StackGroups")
    	.selectAll("path")
    	.data(stackedGroupData)
    	.enter()
    	.append("path")
    	.attr("class", "area")
    	.attr("d", area)
		.attr("fill", function(d) {
	        if (keysGroup.includes(d.key)) {
	            return colorsGroup(d.key);
	        } else {
	            return colorsGroup("Others");
	        }
		})
		.append("title")  //Make tooltip
		.text(function(d, i) {
			return d.key;
		});

	//Create areas for types
	pathsTypes = svgStackedArea.append("g")
		.attr("id", "StackTypes")
		.selectAll("path")
		.data(stackedTypeData)
		.enter()
		.append("path")
		.attr("class", "area")
		.attr("d", area)
		// Make a complicated fill function that divides everything into stuff
		.attr("fill", function(d) {
			return colorsAttackTypeArea(d.key);
		})
		.on("click", function(d) {
			currentState ++;
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

			typeStackedData = stack_number_two(unnestedThisTypeDataset);
			restackedTypeData = stack(allDataSet);


			pathsTypes = d3.selectAll("#StackTypes path")
								.data(restackedTypeData)

			pathsGroups = d3.selectAll("#StackGroups path")
								.data(typeStackedData)
								.attr("opacity", 1);

			if (currentState == 1) {
				pathsTypesTransition = pathsTypes.transition()
				.duration(1000)
				.attr("d", area);

			var areaTransitions = pathsGroups.transition()
				.attr("d", area);				

			
			pathsTypesTransition.transition()
				.on("start", function() {
					pathsTypes.transition()
						.delay(200)
						.duration(1000)
						.attr("opacity", 1);
				})
				.attr("d", area);
			
			var max = d3.max(datasetArea, function(d) {
				var sum = 0
				sum += parseInt(d[thisType])
				
				return sum;
			});
			
			rescale(max, 1000, 1000)

			d3.selectAll("#StackTypes path").transition("named")
				.delay(1000)
				.duration(1000)
				.attr("d", area);

			
			var areaTransitions = pathsGroups.transition()
				.delay(2000)
				.duration(1000)
				.attr("d", area);

			buttonVisibility();
			

			} else if (currentState == 2){

				var stacktypes = d3.selectAll("#StackTypes path")
						.data(restackedTypeData)
						.classed("unclickable", true);

				stacktypes.transition()
						.duration(1000)
						.attr("opacity", 0)

			}
			

			
		})
		.attr("opacity", 1)
		.append("title")  //Make tooltip
		.text(function(d) {
			return d.key;
		});

	// create back button
	var backButton = svgStackedArea.append("g")
		.attr("id", "stackedAreaButton")
		.attr("class", "unclickable")
		.attr("opacity", 0)
		.attr("transform", "translate(" + xScaleArea.range()[0] + "," + yScaleArea.range()[1] + ")");

	backButton.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 70)
		.attr("heigth", 30)

	backButton.append("text")
		.attr("x", 7)
		.attr("y", 20)
		.text("Back")

	backButton.on("click", function(){
			if (currentState == 1) {
				
				d3.selectAll("#StackGroups path")
					.attr("opacity", 0)

				rescale(1100, 1000, 0);

				d3.selectAll("#StackTypes path")
					.data(stackedTypeData)
					/*
					.transition() // TODO fix transition where the stacks seem to pop in from out of no where
					.delay(1000)
					.duration(1000)
					*/

				d3.selectAll("#StackTypes path")
					.transition()
					.attr("d", area)

				d3.selectAll("#StackGroups path")
					.data(stackedGroupData)
					.attr("d", area)

				currentState --;

			} else if (currentState == 2){

				var temp = d3.selectAll("#StackTypes path")
					.classed("unclickable", false)
					.transition(1000)
					.attr("opacity", 1);

				currentState --;				
			}

			if (currentState == 0) {
				buttonVisibility();
			}
	})

	// Draw x-axis included values along the axis.
	svgStackedArea.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (hArea - paddingArea) + ")")
		.call(xAxisArea);

	// Draw y-axis included values along the axis.
	yAxisGroup = svgStackedArea.append("g")
		.attr("class", "axis yaxis")
		.attr("transform", "translate(" + (paddingArea) + ",0)")
		.call(yAxisArea);


    var areaYaxisText = svgStackedArea.append("text");
    var areaXaxisText = svgStackedArea.append("text");

    // Adding text to the y-axis
    areaYaxisText.attr("transform", "rotate(-90)")
        .attr("x", 0 - (hArea / 2))
        .attr("y", 0 )
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of attacks")
        .attr("class", "yAxisLabel");

    // Adding text to the x-axis
    areaXaxisText.attr("x", (wArea/2))
        .attr("y", (hArea - paddingArea + 10))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Year")
        .attr("class", "xAxisLabel");

};