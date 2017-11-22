

main = function() {
  var svgs = d3.select("#simulation svg"),
      margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = +svgs.attr("width") - margin.left - margin.right,
      height = +svgs.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  var g = svgs.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var N = 20;
  var histo = [];

  var i;

  for(i=0; i<N; i++) histo[i] = 1-i/N;

  x.domain(histo.map(function(d,i) { return i; }));
  y.domain([0, d3.max(histo)]);

  g.selectAll(".bar")
    .data(histo)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("id", function(d,i) { return "bar-"+i;})
      .attr("x", function(d,i) { return x(i); })
      .attr("y", function(d) { return y(d); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d); });

}
