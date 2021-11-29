const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const margin = {
  top: 150,
  right: 20,
  bottom: 40,
  left: 90,
};

const width = 920;
const height = 630;

const yearFormat = d3.format("d");
const timeFormat = d3.timeFormat("%M:%S");

const t = d3.transition().duration(300);

const svgContainer = d3
  .select("body")
  .append("svg")
  .attr("class", "svg-container")
  .attr("width", width)
  .attr("height", height);

const chartGroup = svgContainer.append("g");

const tooltip = d3
  .select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .attr("id", "tooltip");

const legend = chartGroup
  .append("g")
  .attr("id", "legend")
  .attr("transform", `translate(${width - 300}, ${margin.top + 50})`);

d3.json(url).then((data) => {
  // Change the Time property in data
  data.forEach((d) => {
    const [minutes, seconds] = d.Time.split(":");
    d.Time = new Date(1970, 0, 1, 0, minutes, seconds);
  });
  // Scales
  const xScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.Year - 1), d3.max(data, (d) => d.Year + 1)])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.Time))
    .range([margin.top, height - margin.bottom])
    .nice();

  const colorScale = d3
    .scaleOrdinal()
    .domain([true, false])
    .range(["darkred", "steelblue"]);

  //Axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(yearFormat)
    .tickSize(-height + (margin.top + margin.bottom))
    .tickSizeOuter(0)
    .tickPadding(5);

  chartGroup
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  // x Axis Label
  chartGroup
    .append("text")
    .attr("class", "xAxis-label")
    .attr("x", width - margin.right - 50)
    .attr("y", height - margin.bottom + 40)
    .text("Years");

  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat(timeFormat)
    .tickSize(-width + (margin.left + margin.right))
    .tickSizeOuter(0)
    .tickPadding(5);

  chartGroup
    .append("g")
    .attr("id", "y-axis")
    .call(yAxis)
    .attr("transform", `translate(${margin.left}, 0)`);

  // y Axis Label
  chartGroup
    .append("text")
    .attr("class", "yAxis-label")
    .attr(
      "transform",
      `translate(${margin.left - 60}, ${margin.top + 170}) rotate(-90)`
    )
    .text("Times in minutes");

  // Title
  chartGroup
    .append("text")
    .attr("id", "title")
    .attr("x", width / 2)
    .attr("y", 45)
    .attr("dx", "0.5em")
    .attr("text-anchor", "middle")
    .text("Doping in Professional Bicycle Racing");

  // SubTitle
  chartGroup
    .append("text")
    .attr("id", "subtitle")
    .attr("x", width / 2)
    .attr("y", 85)
    .attr("text-anchor", "middle")
    .text("35 Fastest times up Alpe d'Huez");

  //Data join & Viz
  chartGroup
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time.toString())
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.Time))
    .attr("r", 8)
    .attr("fill", (d) => colorScale(!!d.Doping))
    .attr("stroke", "black")
    .style("opacity", "0.7")
    .on("mouseover", (d) => {
      tooltip.transition(t).style("opacity", 0.8);
      tooltip
        .attr("data-year", d.Year)
        .html(
          `${d.Name}: ${d.Nationality} <br />
        Year: ${
          d.Year
        }, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds()} <br />
        <br />
        ${d.Doping}`
        )
        .style("left", d3.event.pageX + 5 + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", (d) => {
      tooltip.transition(t).style("opacity", 0);
    });

  // Legend
  const legendGroups = legend
    .selectAll("g")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(0, ${i * 40})`);

  legendGroups
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", (d) => colorScale(d));

  legendGroups
    .append("text")
    .attr("x", 30)
    .attr("y", 10)
    .attr("dy", ".3em")
    .text((d) =>
      d.Doping !== ""
        ? "Riders with doping allegations"
        : "No doping allegations"
    );
});
