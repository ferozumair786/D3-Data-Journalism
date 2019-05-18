// @TODO: YOUR CODE HERE!
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Append an SVG group
const chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// function used for updating x-scale const upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

  // function used for updating y-scale const upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.9,
        d3.max(healthData, d => d[chosenYAxis]) * 1.1
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis const upon click on axis label
function renderXAxis(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating yAxis const upon click on axis label
function renderYAxis(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }


  // function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

//function for rendering text onto circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis){
    textGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("cy", d => newYScale(d[chosenYAxis]))
    return textGroup
    }
  // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let xlabel  = "";
    if (chosenXAxis === "poverty") {
        xlabel = "In Poverty (%):";
    }
    else if (chosenXAxis === "age"){
        xlabel = "Age (Median):";
    }
    else {
        xlabel = "Household Income (Median):"
    }

    let ylabel  = "";
    if (chosenYAxis === "healthcare") {
        ylabel = "Lacks Healthcare (%):";
    }
    else if (chosenYAxis === "obesity"){
        ylabel = "Obese (%):";
    }
    else {
        ylabel = "Smokes (%):"
    }
    let toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${xlabel} ${d[chosenXAxis]}<br>
                     ${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    // onmouseover event
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data, this);
    });

  return circlesGroup;
}

// // add text to circles
function stateText(healthData, textGroup) {
    statesText = textGroup.selectAll(".stateText")
                .data(healthData)
                // .enter()
                .append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .attr("x", d => xScale(d.poverty))
                .attr("y", d => yScale(d.healthcare) + 5)
                .text(d => d.abbr)
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    const healthData = await d3.csv("/assets/data/data.csv");

    // parse data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(healthData, chosenXAxis);

    // Create y scale function
    let yLinearScale = yScale(healthData, chosenYAxis);


    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, 0)`)
        .call(leftAxis);

    //Finish adding yaxis transitions

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 7.5)
        .attr("fill", "blue")
        .attr("opacity", ".75")
    // console.log(circlesGroup)

    // // add text to circles
    // let circleText =  chartGroup.selectAll(".stateText")
    //     .data(healthData)
    //     .enter()
    //     .classed("stateText", true)
    //     .append("text")
    //     .attr("x", d => xLinearScale(d[chosenXAxis]))
    //     .attr("y", d => yLinearScale(d[chosenYAxis]))
    //     .text(d => d.abbr)
    // console.log(circleText)

    // Create group for  2 x- axis labels
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("x-label", true)
        .classed("active", true)
        .text("In Poverty (%)");

    let ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("x-label", true)
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("x-label", true)
        .classed("inactive", true)
        .text("Household Income (Median)");

    // append y axes
    let healthLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40 - margin.left)
        .attr("x", 40 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("y-label", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)")
        .on("click", function() {
        // get value of selection
        let yvalue = d3.select(this).attr("value");
        console.log(this)
        console.log(yvalue)
        if (yvalue !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = yvalue;

            console.log(`ChosenYAxis: ${chosenYAxis}`)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // // updates x axis with transition
            // yAxis = renderYAxis(yLinearScale, yAxis);

            // update y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthLabel
                    .classed("active", true)
                    .classed("inactive", false);
                // console.log(yLabel)
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity"){
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
        }
    });

    let obeseLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 30 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .classed("y-label", true)
        .classed("inactive", true)
        .text("Obesity (%)")
        .on("click", function() {
        // get value of selection
        let yvalue = d3.select(this).attr("value");
        console.log(this)
        console.log(yvalue)
        if (yvalue !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = yvalue;

            console.log(`ChosenYAxis: ${chosenYAxis}`)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // // updates x axis with transition
            // yAxis = renderYAxis(yLinearScale, yAxis);

            // update y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthLabel
                    .classed("active", true)
                    .classed("inactive", false);
                // console.log(yLabel)
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity"){
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
        }
    });

    let smokeLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left )
        .attr("x", 30 - (height/2))
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("y-label", true)
        .classed("inactive", true)
        .text("Smokes (%)")
        .on("click", function() {
        // get value of selection
        let yvalue = d3.select(this).attr("value");
        console.log(this)
        console.log(yvalue)
        if (yvalue !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = yvalue;

            console.log(`ChosenYAxis: ${chosenYAxis}`)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // // updates x axis with transition
            // yAxis = renderYAxis(yLinearScale, yAxis);

            // update y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthLabel
                    .classed("active", true)
                    .classed("inactive", false);
                // console.log(yLabel)
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity"){
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
        }
    });
    // let healthLabel = labelsgroup.append("text")
    //     .attr("transform", "rotate(-90")
    //     .attr("y", 0-margin.left)
    //     .attr("x", 0 - (height / 2))
    //     .attr("dy", "1em")
    //     .attr("value", "healthcare")
    //     .classed("axis-text", true)
    //     .classed("active", true)
    //     .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // update the stateText to the 
    circleText = stateText(healthData, circlesGroup)
    // x axis labels event listener
    labelsGroup.selectAll(".x-label")
        .on("click", function() {
        // get value of selection
        let xvalue = d3.select(this).attr("value");
        if (xvalue !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = xvalue;

            console.log(`ChosenXAxis: ${chosenXAxis}`)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // // update y axis with transition
            // yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // update circletext with new info
            // textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age"){
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
            // console.log(xvalue)
        }
        

                
    
    });

    // // event listener for y axis
    // //commented out because it has trouble finding the y-axis
    // labelsGroup.selectAll(".y-label")
    //     .on("click", function() {
    //     // get value of selection
    //     let yvalue = d3.select(this).attr("value");
    //     console.log(this)
    //     console.log(yvalue)
    //     if (yvalue !== chosenYAxis) {

    //         // replaces chosenXAxis with value
    //         chosenYAxis = yvalue;

    //         console.log(`ChosenYAxis: ${chosenYAxis}`)

    //         // functions here found above csv import
    //         // updates x scale for new data
    //         yLinearScale = yScale(healthData, chosenYAxis);

    //         // // updates x axis with transition
    //         // yAxis = renderYAxis(yLinearScale, yAxis);

    //         // update y axis with transition
    //         yAxis = renderYAxis(yLinearScale, yAxis);

    //         // updates circles with new x values
    //         circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    //         // updates tooltips with new info
    //         circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //         // changes classes to change bold text
    //         if (chosenYAxis === "healthcare") {
    //             healthLabel
    //                 .classed("active", true)
    //                 .classed("inactive", false);
    //             // console.log(yLabel)
    //             obeseLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //             smokeLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //         }
    //         else if (chosenYAxis === "obesity"){
    //             healthLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //             obeseLabel
    //                 .classed("active", true)
    //                 .classed("inactive", false);
    //             smokeLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //         }
    //         else {
    //             healthLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //             obeseLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //             smokeLabel
    //                 .classed("active", true)
    //                 .classed("inactive", false);  
    //         }
    //     }
    // });

    
})()