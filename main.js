main();

function main() {

  ///////////////////////////
  ///// Buttons //////
    d3.select("#pauseB")
      .on("click", pauseSym);

    d3.select("#muteB")
      .on("click", muteSym);

    d3.select("#restartB")
      .on("click", restartSym);
  ////////////////////

  var runningFlag = true;
  var timer;

///////// for the simulation ///////////
  var svgs = d3.select("#simulation svg"),
      margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = +svgs.attr("width") - margin.left - margin.right,
      height = +svgs.attr("height") - margin.top - margin.bottom;

  var g = svgs.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
////////////////////////////////////////

///////// for the histogramm ///////////
  var svgi = d3.select("#info svg"),
      margini = {top: 20, right: 20, bottom: 20, left: 50},
      widthi = +svgi.attr("width") - margini.left - margini.right,
      heighti = +svgi.attr("height") - margini.top - margini.bottom;

  var gi = svgi.append("g")
      .attr("transform", "translate(" + margini.left + "," + margini.top + ")");
////////////////////////////////////////

  var N = 50;
  var rate = 300;
  var barcol0 = "steelblue";
  var barcol1 = "red";
  var bars = [];

  var histo = [];

  var notes = "ABCDEFG".split("");
  var piano = Synth.createInstrument('piano');

  var i;

  ////////////////////
  // inputs //
    d3.select("#rateValue").on("input", function() {
      rate = +this.value;
      clearInterval(timer);
      if(runningFlag) timer = setInterval(run, rate);
      d3.select("#rateLabel").text(rate+"ms");
    });
  ////////////

  for(i=0; i<N; i++) {
    bars[i] = 1-i/N;
    histo[i] = 1e-6;
  }

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  x.domain(bars.map(function(d,i) { return i; }));
  y.domain([0, d3.max(bars)]);

  g.selectAll(".bar")
    .data(bars)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("id", function(d,i) { return "bar-"+(N-i-1);}) ////
      .attr("x", function(d,i) { return x(i); })
      .style("fill", barcol0)
      .attr("y", function(d) { return y(d); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d); });

  var xi = d3.scaleLog().base(10)
                .range([0, widthi])
                .domain([1, N]),
      yi = d3.scaleLog().base(10)
                .range([heighti, 0])
                .domain([1, 1000]);

  gi.selectAll(".point")
    .data(histo)
    .enter().append("circle")
      .attr("class", "point")
      .attr("id", function(d,i) { return "point-"+i;})
      .attr("cx", function(d,i) { return xi(i+1e-6); })
      .attr("cy", function(d) { return yi(d); })
      .attr("r", "8")
      .attr("fill", "white")
      .attr("stroke", "black")
      // .attr("width", x.bandwidth())
      // .attr("height", function(d) { return height - y(d); });

  gi.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + yi(1) + ")")
  .call(d3.axisBottom(xi).ticks(10,",.0f"));

  gi.append("text")
  .attr("id", "label--x")
  .attr("transform", "translate(" + (470) + "," + (heighti+margini.bottom) + ")")
  .text("Index");


  gi.append("g")
  .attr("class", "axis axis--y")
  .attr("transform", "translate("+ xi(1) +","+ yi(1000) + ")") ////
  .call(d3.axisLeft(yi).ticks(10,",.0f"));

  gi.append("text")
  .attr("id", "label--y")
  .attr("transform", "translate(" + (-25) + "," + (heighti/2+15) + ")rotate(-90)")
  // .attr("transform", "rotate(-90)")
  .text("Count");

  gi.append("line")
    .attr("x1", xi(1))
    .attr("y1", yi(100))
    .attr("x2", xi(N-1))
    .attr("y2", yi(100/(N-1)))
    .attr("stroke-width", 3)
    .attr("stroke", "red")
    .style("opacity", "0.3");

  var pos;
  start();

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

  function start() {

    runningFlag = true;
    pos=N-1; ////

    d3.selectAll(".bar")
      .style("opacity", "1");

    timer = setInterval(run, rate);
  }

  function run() {
    // let r = pos + 1 + Math.random()*(N-pos-1) | 0; // integer from pos+1 to N-1
    let r = Math.random()*(pos) | 0; // integer from pos-1 to 0 ////
    pos = r;
    histo[pos] += 1;

    let sound = notes[(pos)%7]; ////
    let octave = 2+Math.floor((pos)/13); ////
    piano.play(sound, octave, .7*rate/1000); // plays C4 for 2s using the 'piano' sound profile

    for( i=N-1; i>r; i--) { ////
      d3.select("#bar-"+i)
        .style("opacity", "0.3");
    }

    d3.select("#bar-"+r)
      .style("fill", barcol1)
      .transition()
      .duration(0.7*rate)
      .style("fill", barcol0);

    d3.select("#point-"+r)
      .transition()
      .duration(0.7*rate)
      .attr("cy", yi(histo[r]))

    if(pos === 0) { ////
      clearInterval(timer);
      start();
    }
  }

  function pauseSym() {
    if (runningFlag) {
      clearInterval(timer);
      runningFlag = false;
      d3.select("#bar-"+pos)
        .transition()
        .duration(100)
        .style("fill", barcol1);
    } else {
      timer = setInterval(run, rate);
      runningFlag = true;
      d3.select("#bar-"+pos)
        .style("fill", barcol0);
    }
  }

  function restartSym() {
      clearInterval(timer);
      for(i=0; i<N; i++) histo[i] = 1e-6;

      d3.selectAll(".bar")
        .transition()
        .duration(1000)
        .style("fill", barcol0)
        .style("opacity", "1");

      gi.selectAll(".point")
          .transition()
          .duration(1000)
          .attr("cy", yi(1e-6));

      setTimeout(start, 1100);
  }

  function muteSym() {
    Synth.getVolume()>1e-3? Synth.setVolume(0.0): Synth.setVolume(1.0);
  }

}
