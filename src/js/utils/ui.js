
const renderSvg = function (g, clazz, rainbow, rules) {
  let svg = d3.select(clazz);
  svg.select("g").remove();
  let inner = svg.append("g");

  // Set up zoom support
  const zoom = d3.zoom().on("zoom", function () {
    inner.attr("transform", d3.event.transform);
  });
  svg.call(zoom);
  // Create the renderer
  let render = new dagreD3.render();
  // Run the renderer. This is what draws the final graph.
  render(inner, g);
  // Center the graph
  const initialScale = 0.2;
  svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, 20).scale(initialScale));
  svg.selectAll("g.node.start").on("click", function (id) {
    const n = id.split("start-")[1];
    document.body.classList.toggle("enable-path-" + n);
    let arr = document.body.classList.value;
    arr = arr.split(" ");
    if (arr[0] !== "") {
      let ids = [];
      for (let i = 0; i < arr.length; i++) {
        ids.push(arr[i].split("enable-path-")[1]);
      }
      let data = buildRules(ids, rules);
      let dynamicData = createDynamicPieChart(data);
      displayPieChar(dynamicData.data, dynamicData.options, "piechart-4", rainbow, data);
    } else {
      let div = document.getElementById("piechart-4");
      while (div.hasChildNodes()) div.removeChild(div.childNodes[0])
    }
    console.log("Clicked " + id);
  });
};