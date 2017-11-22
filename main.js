
main = function() {
  var svgs = d3.select("#simulation svg"),
      margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = +svgs.attr("width") - margin.left - margin.right,
      height = +svgs.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  var g = svgs.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var N = 50;
  var rate = 200;
  var barcol0 = "steelblue";
  var barcol1 = "red";
  var bars = [];

  var histo = [];

  var notes = "ABCDEFG".split("");
  var piano = Synth.createInstrument('piano');

  var i;

  for(i=0; i<N; i++) {
    bars[i] = 1-i/N;
    histo[i] = 0;
  }

  x.domain(bars.map(function(d,i) { return i; }));
  y.domain([0, d3.max(bars)]);

  g.selectAll(".bar")
    .data(bars)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("id", function(d,i) { return "bar-"+i;})
      .attr("x", function(d,i) { return x(i); })
      .style("fill", barcol0)
      .attr("y", function(d) { return y(d); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d); });

  start = function() {

    let timer;
    let pos=0;

    d3.selectAll(".bar")
      .style("opacity", "1");

    timer = setInterval( function() {

      let r = pos + 1 + Math.random()*(N-pos-1) | 0; // integer from pos+1 to N-1
      pos = r;
      histo[pos]++;
      
      let sound = notes[(N-pos)%7];
      let octave = 2+Math.floor((N-pos)/14);
      piano.play(sound, octave, .5*rate/1000); // plays C4 for 2s using the 'piano' sound profile

      for( i=0; i<r; i++) {
        d3.select("#bar-"+i)
          .style("opacity", "0.5");
      }

      d3.select("#bar-"+r)
        .style("fill", barcol1)
        .transition()
        .duration(0.7*rate)
        .style("fill", barcol0);

      if(pos === N-1) {
        clearInterval(timer);
        start();
      }
    }, rate);
  }

  start();



}
