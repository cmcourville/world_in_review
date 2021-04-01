var width = 600,
  height = 500,
  sens = 0.25,
  focused;
//Setting projection
var projection = d3.geo.orthographic()
  .scale(245)
  .rotate([0, 0])
  .translate([width / 2, height / 2])
  .clipAngle(90);
var path = d3.geo.path()
  .projection(projection);
//SVG container
var svg = d3.select('#my_dataviz')
  .append("svg")
  .attr("width", width)
  .attr("height", height);
//Adding water
svg.append("path")
  .datum({ type: "Sphere" })
  .attr("class", "water")
  .attr("d", path);
var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
  countryList = d3.select("body").append("select").attr("name", "countries");
var backgroundCircle = svg.append("circle")
  .attr('cx', width / 2)
  .attr('cy', height / 2)
  .attr('r', projection.scale())
  .attr('class', 'globe')
  .attr("filter", "url(#glow)")
  .attr("fill", "url(#gradBlue)");
queue()
  .defer(d3.json, "https://raw.githubusercontent.com/ecglover8/world-110m.json/master/world-110m.json")
  .defer(d3.tsv, "https://raw.githubusercontent.com/KoGor/Map-Icons-Generator/master/data/world-110m-country-names.tsv")
  .defer(d3.csv, "https://raw.githubusercontent.com/cmcourville/04-Remix/master/country_song_data.csv?token=AHXQFOQDJJC55L5S4T2POJ3AN4HYY")
  .await(ready);
//Main function
function ready(error, world, countryData) {
  var countryById = {},
    countries = topojson.feature(world, world.objects.countries).features;
  //Adding countries to select
  countryData.forEach(function (d) {
    countryById[d.id] = d.name;
    option = countryList.append("option");
    option.text(d.name);
    option.property("value", d.id);
  });
  //Drawing countries on the globe
  var world = svg.selectAll("path.land")
    .data(countries)
    .enter().append("path")
    .attr("class", "land")
    .attr("d", path)
    //Drag event
    .call(d3.behavior.drag()
      .origin(function () { var r = projection.rotate(); return { x: r[0] / sens, y: -r[1] / sens }; })
      .on("drag", function () {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll(".focused").classed("focused", focused = false);
      }))
    //Mouse events
    .on("mouseover", function (d) {
      countryTooltip.text(countryById[d.id])
        .style("left", (d3.event.pageX + 7) + "px")
        .style("top", (d3.event.pageY - 15) + "px")
        .style("display", "block")
        .style("opacity", 1);
    })
    .on("click",function(d){
        d3.select("select").node().value=d.id;
        onChange(d3.select("select").node());
    })
    .on("mouseout", function (d) {
      countryTooltip.style("opacity", 0)
        .style("display", "none");
    })
    .on("mousemove", function (d) {
      countryTooltip.style("left", (d3.event.pageX + 7) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
    })
  
  //Country focus on option select
  
  function onChange(this_country){
    var rotate = projection.rotate(),
      focusedCountry = country(countries, this_country),
      p = d3.geo.centroid(focusedCountry);
    svg.selectAll(".focused").classed("focused", focused = false);
    //Globe rotating
    (function transition() {
      d3.transition()
        .duration(2500)
        .tween("rotate", function () {
          var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function (t) {
            projection.rotate(r(t));
            svg.selectAll("path").attr("d", path)
              .classed("focused", function (d, i) { return d.id == focusedCountry.id ? focused = d : false; });
          };
        })
    })();
    // a function to clean my_chart before drawing new table
    function cleanChartDiv() {
      d3.select('#my_chart').selectAll('table').remove()
    }
    // start chart 
    var tabulate = function (data, columns) {
      cleanChartDiv();
      var table = d3.select('#my_chart')
        .append('table')
      var thead = table.append('thead')
      var tbody = table.append('tbody')
      
      var rows = tbody.selectAll('tr')
        .data(data.filter(function (d) {
          if (d.country == (countryById[focusedCountry.id]).toLowerCase()) {
            return d.country == (countryById[focusedCountry.id]).toLowerCase();
          }
        })
        )
        .enter()
        .append('tr')
    if(rows.selectAll("td").length>0){
      thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) { return d })
      var cells = rows.selectAll('td')
        .data(function (row) {
          return columns.map(function (column) {
            return {
              column: column,
              value: row[column]
            }
          })
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value })
      return table;
    }else{
        console.log(rows.selectAll("td").length);
        return;
    }
};
    
    d3.csv('https://raw.githubusercontent.com/cmcourville/04-Remix/master/country_song_data.csv?token=AHXQFOQDJJC55L5S4T2POJ3AN4HYY', function (data) {
      var columns = ['title', 'artist', 'country']
      tabulate(data, columns)
    });
    function country(cnt, sel) {
      for (var i = 0, l = cnt.length; i < l; i++) {
        if (cnt[i].id == sel.value) { return cnt[i]; }
      }
    };
 
  
  d3.select("select").on("change", function () {
    onChange(this);
  });
  
  };

}
