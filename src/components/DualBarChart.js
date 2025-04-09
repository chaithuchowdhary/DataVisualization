import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

const DualBarChart = ({ dataUrl }) => {
  const [data, setData] = useState([]);
  const[stateData, setStateData] = useState([]);
  const topChartRef = useRef();
  const bottomChartRef = useRef();
  
  // Fetch CSV data
  useEffect(() => {
    if (!dataUrl) return;
    
    d3.csv(dataUrl)
      .then(csvData => {
        // Convert string values to numbers
        const processedData = csvData.map(d => ({
          City: d.City,
          Mean: +d.Mean // Convert to number
        }))
        .filter(d => !isNaN(d.Mean)); // Filter out any rows with invalid numbers
        const processState = csvData.map(d => ({
            City: d.State_Name,
            Mean: +d.Mean // Convert to number
            }))
        .filter(d => !isNaN(d.Mean));
        setStateData(processState);
        setData(processedData);
      })
      .catch(error => console.error("Error loading CSV data:", error));
  }, [dataUrl]);

  // Create charts when data is loaded
  useEffect(() => {
    if (!data || data.length === 0) return;
    if (!stateData || stateData.length === 0) return;
    
    // Sort data for top and bottom cities
    const sortedStateData = [...stateData].sort((a, b) => b.Mean - a.Mean);
    const sortedData = [...data].sort((a, b) => b.Mean - a.Mean);
    const topCities = sortedData.slice(0, 10);
    const bottomCities = sortedStateData.slice(0,10); 
    console.log("Top Cities:", topCities);
    console.log("Top States:", bottomCities);
    // Create the charts
    createChart(topChartRef.current, topCities, "Top 10 Cities", "#3498db");
    createChart(bottomChartRef.current, bottomCities, "Top 10 States", "#e74c3c");
    
  }, [data]);
  
  const createChart = (element, chartData, title, barColor) => {
    // Clear previous chart
    d3.select(element).selectAll("*").remove();
    
    // Chart dimensions
    const width = 550;
    const height = 450;
    const margin = { top: 50, right: 30, bottom: 100, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(element)
      .attr("width", width)
      .attr("height", height);
      
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(title);
      
    // Create scales
    const x = d3.scaleBand()
      .domain(chartData.map(d => d.City))
      .range([margin.left, width - margin.right])
      .padding(0.2);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.Mean) * 1.1]) // Add 10% padding
      .nice()
      .range([height - margin.bottom, margin.top]);
      
    // Add chart group
    const g = svg.append("g");
    
    // Add bars with animation
    g.selectAll("rect")
      .data(chartData)
      .join("rect")
      .attr("x", d => x(d.City))
      .attr("width", x.bandwidth())
      .attr("y", height - margin.bottom)
      .attr("height", 0)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", barColor)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", d => y(d.Mean))
      .attr("height", d => height - margin.bottom - y(d.Mean));
      
    // Add hover effects after transition
    g.selectAll("rect")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d3.color(barColor).darker(0.7))
          .attr("stroke", "#333")
          .attr("stroke-width", 2);
          
        // Add tooltip
        svg.append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.City) + x.bandwidth() / 2)
          .attr("y", y(d.Mean) - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", "#333")
          .text(`$${d.Mean.toFixed(2)}`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", barColor)
          .attr("stroke", "none");
          
        // Remove tooltip
        svg.selectAll(".tooltip").remove();
      });
    
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em");
      
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "12px");
      
    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Mean Value");
    
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "3,3")
      .selectAll("line")
      .style("stroke-opacity", 0.5);
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "row", 
      flexWrap: "wrap", 
      justifyContent: "center",
      gap: "20px",
      background: "#f8f9fa", 
      padding: "20px", 
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <svg ref={topChartRef}></svg>
      <svg ref={bottomChartRef}></svg>
    </div>
  );
};

export default DualBarChart;
