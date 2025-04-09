import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

export default function ChoroplethMap() {
  const [mapData, setMapData] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const svgRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    // Fetch US map data (TopoJSON)
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then(us => {
        setMapData(feature(us, us.objects.states));
      })
      .catch(error => {
        console.error("Error loading US map data:", error);
      });

    // Load data from JSON file
    // setIncomeData(data);
    fetch('https://gist.githubusercontent.com/chaithuchowdhary/a487127476e1ec697be7e2f4abf7a15b/raw/67f493e03d11d649fec8760546e8155f6308dd50/stateincome.json')
    .then(response => response.json())
    .then(data => {
      setIncomeData(data);
    })
  }, []);

  const getStateData = (stateName) => {
    return incomeData.find(d => d.state === stateName);
  };

  const handleMouseOver = (event, d) => {
    const state = mapData.features.find(feature => feature.id === d.id);
    if (state) {
      const stateName = state.properties.name;
      setSelectedState(stateName);
    }
  };

  useEffect(() => {
    if (!mapData || incomeData.length === 0) return;

    console.log("Rendering map with income data length:", incomeData.length);

    const svg = d3.select(svgRef.current);
    const width = 700; // Reduced map width to make room for chart
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    // Clear previous rendering
    svg.selectAll("*").remove();

    // Set up projection and path generator
    const projection = d3.geoAlbersUsa()
      .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], mapData);
    const path = d3.geoPath().projection(projection);

    // Create a mapping of state names to their mean incomes
    const stateIncomeMap = {};
    incomeData.forEach(d => {
      stateIncomeMap[d.state] = d.mean;
    });

    // Find min and max for color scale
    const incomeValues = incomeData.map(d => d.mean).filter(val => !isNaN(val));
    const minIncome = d3.min(incomeValues);
    const maxIncome = d3.max(incomeValues);
    
    // Color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([minIncome, maxIncome]);

    // Add state paths
    svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .selectAll("path")
      .data(mapData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const stateName = d.properties.name;
        return stateIncomeMap[stateName] ? colorScale(stateIncomeMap[stateName]) : "#ccc";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .attr("class", "state-path")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5);
        handleMouseOver(event, d);
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5);
      });

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text("Mean Income by State");

    // Add legend
    const legendWidth = 300;
    const legendHeight = 15;
    const legendPosition = { x: width - margin.right - legendWidth, y: height - margin.bottom };

    const legendScale = d3.scaleLinear()
      .domain([minIncome, maxIncome])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .tickSize(6)
      .tickFormat(d3.format("$,.0f"))
      .ticks(5);

    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
    
    linearGradient.selectAll("stop")
      .data([
        { offset: "0%", color: colorScale.range()[0] },
        { offset: "100%", color: colorScale.range()[1] }
      ])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    svg.append("g")
      .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`)
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#linear-gradient)");

    svg.append("g")
      .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y + legendHeight})`)
      .call(legendAxis);

    svg.append("text")
      .attr("x", legendPosition.x + legendWidth / 2)
      .attr("y", legendPosition.y - 10)
      .attr("text-anchor", "middle")
      .text("Mean Income ($)");

  }, [mapData, incomeData]);

  // Update the bar chart when a state is selected
  useEffect(() => {
    if (!selectedState || !chartRef.current) return;
    
    const stateData = getStateData(selectedState);
    if (!stateData || !stateData.cities || stateData.cities.length === 0) return;
    
    const topCities = stateData.cities;
    const stateMean = stateData.mean;
    
    const svg = d3.select(chartRef.current);
    const width = 320;
    const height = 500;
    const margin = { top: 70, right: 20, bottom: 100, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Clear previous rendering
    svg.selectAll("*").remove();
    
    // Calculate scales
    const xScale = d3.scaleBand()
      .domain(topCities.map(d => d.city))
      .range([0, chartWidth])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(topCities, d => d.mean) * 1.1])
      .range([chartHeight, 0]);

    const formatMoney = d3.format("$,.0f");
    
    // Add title and state info
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(`${selectedState}`);
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text(`State Mean Income: ${formatMoney(stateMean)}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Add Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => formatMoney(d))
        .ticks(5))
      .call(g => g.select(".domain").remove());
    
    // Add Y grid lines
    g.append("g")
      .attr("class", "grid-lines")
      .selectAll("line")
      .data(yScale.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 0.5);
    
    // Add X-axis
    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("x", -5)
      .attr("y", 6)
      .attr("font-size", 10);
    
    // Add Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -chartHeight / 2)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .text("Mean Income");
    
    // Add bars with transition
    g.selectAll(".bar")
      .data(topCities)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.city))
      .attr("width", xScale.bandwidth())
      .attr("y", chartHeight)
      .attr("height", 0)
      .attr("fill", "#4682b4")
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("y", d => yScale(d.mean))
      .attr("height", d => chartHeight - yScale(d.mean));
    
    // Add value labels on top of bars with transition
    g.selectAll(".bar-label")
      .data(topCities)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d.city) + xScale.bandwidth() / 2)
      .attr("y", chartHeight)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 300)
      .attr("y", d => yScale(d.mean) - 5)
      .attr("opacity", 1)
      .text(d => formatMoney(d.mean));
    
    // Add no-state-selected message when no state is selected
    if (!selectedState) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .text("Hover over a state to see city data");
    }
    
  }, [selectedState, incomeData]);

  return (
    <div className="relative">
      <div className="mb-4">
        {incomeData.length > 0 ? (
          <p className="text-sm text-gray-600">Loaded data for {incomeData.length} states.</p>
        ) : (
          <p className="text-sm text-gray-600">Loading data...</p>
        )}
      </div>
      
      <div className="flex flex-row justify-between">
        {/* Map Section */}
        <div className="w-2/3">
          <svg ref={svgRef} width="100%" height="500" className="mx-auto"></svg>
        </div>
        
        {/* Bar Chart Section */}
        <div className="w-1/3 bg-white rounded-lg shadow-md border border-gray-200 p-2">
          {selectedState ? (
            <svg ref={chartRef} width="100%" height="500"></svg>
          ) : (
            <div className="h-500 flex items-center justify-center text-gray-500">
              <p>Hover over a state to view city income data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}