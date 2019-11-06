"use-strict";

  let data = "";
  let svgContainer = "";
  let popChartContainer = "";
  const size = {
      width: 1000,
      height: 800,
      marginAll: 50,
      marginLeft: 50,
  }
  const small = {
      width: 500,
      height: 500,
      marginAll: 50,
      marginLeft: 80
  }

  window.onload = function () {
    svgContainer = d3.select("#chart")
        .append('svg')
        .attr('width', size.width)
        .attr('height', size.height);
    popChartContainer = d3.select("#popChart")
        .append('svg')
        .attr('width', 1)
        .attr('height', 1);
    legendContainer = d3.select("#legend")
        .append('svg')
        .attr('width', size.width)
        .attr('height', size.height);
    d3.csv("./pokemon.csv")
    .then((d) => makeScatterPlot(d))
}

  function makeScatterPlot(data) {

    let def = data.map((row) => parseInt(row["Sp. Def"]));
    let total = data.map((row) =>  parseFloat(row["Total"]));

    let generationFilter = d3.select("#filter").append("select")
        .attr("name", "Generation");

    let legendaryFilter = d3.select("#Legendfilter").append("select")
        .attr("name", "Legendary");

    const axesLimits = findMinMax(def, total);

    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total", svgContainer, size);

    plotData(mapFunctions, data);

    makeLabels(svgContainer, size, "Pokemon: Special Defense vs Total Stats", 'Sp. Def', 'Total');

    let generation = [...new Set(data.map(d => d["Generation"]))];
    generation.push("All");

    let legendary = [...new Set(data.map(d => d["Legendary"]))];
    legendary.push("All");
    let defaultGeneration = 1;

    let Goptions = generationFilter.selectAll("option")
        .data(generation)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
        .attr("selected", function(d){ return d == defaultGeneration; });

    let Loptions = legendaryFilter.selectAll("option")
        .data(legendary)
        .enter()
        .append("option")
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
        .attr("selected", function(d){ return d == "True"; });

    var currentLegend = "All";
    var currentGeneration = "All";

    generationFilter.on("change", function() {
        currentGeneration = this.value;
        showCirclesG(this, data, currentLegend);
    });

    legendaryFilter.on("change", function() {
        currentLegend = this.value;
        showCirclesL(this, data, currentGeneration);
    });

  }

  function showCirclesG(me, data, currentLegend) {
      let selected = me.value;
      displayOthers = me.checked ? "inline" : "none";
      display = me.checked ? "none" : "inline";

      svgContainer.selectAll(".circles")
          .data(data)
          .filter(function(d) {
              if(currentLegend != "All")
              {
                  return selected != d["Generation"] || currentLegend != d["Legendary"];
              }
              else
              return selected != d["Generation"] ;
          })
          .attr("display", displayOthers);

      svgContainer.selectAll(".circles")
          .data(data)
          .filter(function(d) {
              if(currentLegend != "All")
              {
                  return selected == d["Generation"] && currentLegend == d["Legendary"];
              }
              else
              return selected == d["Generation"] ;
          })
          .attr("display", display);

      if(selected == "All" && currentLegend != "All")
      {
          svgContainer.selectAll(".circles")
          .data(data)
          .filter(function(d) {return currentLegend == d["Legendary"];})
          .attr("display", display);
      }
      if(selected == "All" && currentLegend == "All")
      {
          svgContainer.selectAll(".circles")
          .data(data)
          .attr("display", display);
      }
  }

  function showCirclesL(me, data, currentGeneration) {
      let selected = me.value;
      displayOthers = me.checked ? "inline" : "none";
      display = me.checked ? "none" : "inline";

      svgContainer.selectAll(".circles")
          .data(data)
          .attr("display", display);

      svgContainer.selectAll(".circles")
          .data(data)
          .filter(function(d) {
              if(currentGeneration != "All")
              {
                  return selected != d["Legendary"] || currentGeneration != d["Generation"];
              }

              else
              return selected != d["Legendary"];
          })
          .attr("display", displayOthers);

      svgContainer.selectAll(".circles")
          .data(data)
          .filter(function(d) {
              if(currentGeneration != "All")
              return selected == d["Legendary"] && currentGeneration == d["Generation"];
              else
              return selected == d["Legendary"];
          })
          .attr("display", display);

      if(selected == "All" && currentGeneration != "All")
      {
          svgContainer.selectAll(".circles")
          .data(data)
          .filter(function(d) {
                  return currentGeneration == d["Generation"];
          })
          .attr("display", display);
      }
      if(selected == "All" && currentGeneration == "All")
      {
          svgContainer.selectAll(".circles")
          .data(data)
          .attr("display", display);
      }
  }

  function plotData(map, data) {

      let pop_data = data.map((row) => +row["Sp. Def"]);
      let pop_limits = d3.extent(pop_data);
      let type1 = data.map((row) => row["Type 1"]);

      var color = d3.scaleOrdinal()
      .domain(Array.from(new Set(type1)))
      .range([ "#4E79A7", "#A0CBE8", "#F28E2B", "#FFBE&D", "#59A14F", "#8CD17D", "#B6992D", "#499894"
      , "#86BCB6", "#86BCB7", "#E15759", "#FF9D9A", "#79706E", "#BAB0AC", "#D37295"]);

      legendContainer.selectAll("mydots")
      .data(Array.from(new Set(type1)))
      .enter()
      .append("circle")
          .attr("cx", 100)
          .attr("cy", function(d,i){ return 100 + i*25})
          .attr("r", 8)
          .style("fill", function(d){ return color(d)});

      legendContainer.selectAll("mylabels")
      .data(Array.from(new Set(type1)))
      .enter()
      .append("text")
      .attr("x", 120)
      .attr("y", function(d,i){ return 100 + i*25})
      .style("fill", "Black")
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

      let xMap = map.x;
      let yMap = map.y;

      let div = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

      let toolChart = div.append('svg')
          .attr('width', small.width)
          .attr('height', small.height)

      svgContainer.selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('cx', xMap)
          .attr('cy', yMap)
          .attr('stroke-width', 2)
          .attr("class", "circles")
          .attr('r', 8)
          .style("fill", function(d) { return color((d["Type 1"]));})
          .on("mouseover", (d) => {
              toolChart.selectAll("*").remove()
              div.transition()
                  .duration(200)
                  .style("opacity", .9);
                  div.html("" + "<b>" + d["Name"] + "</b>" + "<br/>" +
                          "Type 1: " + d["Type 1"] + "<br/>" +
                          "Type 2: " + d["Type 2"])
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px")

          })
          .on("mouseout", (d) => {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
  }

  function makeLabels(svgContainer, size, title, x, y) {
      svgContainer.append('text')
          .attr('x', (size.width - 2 * size.marginAll) / 2 - 90)
          .attr('y', size.marginAll / 2 + 10)
          .style('font-size', '10pt')
          .text(title);

      svgContainer.append('text')
          .attr('x', (size.width - 2 * size.marginAll) / 2 - 30)
          .attr('y', size.height - 10)
          .style('font-size', '10pt')
          .text(x);

      svgContainer.append('text')
          .attr('transform', 'translate( 15,' + (size.height / 2 + 30) + ') rotate(-90)')
          .style('font-size', '10pt')
          .text(y);
  }

  function drawAxes(limits, x, y, svgContainer, size) {
      let xValue = function (d) {
          return +d[x];
      }

      let xScale = d3.scaleLinear()
          .domain([limits.defMin - 5, limits.defMax + 5])
          .range([0 + size.marginAll, size.width - size.marginAll])

      let xMap = function (d) {
          return xScale(xValue(d));
      };

      let xAxis = d3.axisBottom().scale(xScale);
      svgContainer.append("g")
          .attr('transform', 'translate(0, ' + (size.height - size.marginAll) + ')')
          .call(xAxis);

      let yValue = function (d) {
          return +d[y]
      }

      let yScale = d3.scaleLinear()
          .domain([limits.totalMax + 15, limits.totalMin - 15])
          .range([0 + size.marginAll, size.height - size.marginAll])

      let yMap = function (d) {
          return yScale(yValue(d));
      };

      let yAxis = d3.axisLeft().scale(yScale);
      svgContainer.append('g')
          .attr('transform', 'translate(' + size.marginAll + ', 0)')
          .call(yAxis);

      return {
          x: xMap,
          y: yMap,
          xScale: xScale,
          yScale: yScale
      };
  }

  function findMinMax(def, total) {
      return {
          defMin: d3.min(def),
          defMax: d3.max(def),
          totalMin: d3.min(total),
          totalMax: d3.max(total)
      }
  }
