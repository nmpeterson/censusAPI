var app;
require([
  // ArcGIS
  "esri/map",
  "esri/dijit/Search",
  "dojo/query",
  // Calcite Maps
  "calcite-maps/calcitemaps-v0.10",

  // Bootstrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",
  "dojo/domReady!"
], function(Map, Search, query, CalciteMaps) {

  // App
  app = {
    map: null,
    basemap: "dark-gray",
    center: [-87.9298, 41.8781], // lon, lat
    zoom: 9,
    initialExtent: null,
    searchWidgetNav: null,
    searchWidgetPanel: null
  }
  // Map
  app.map = new Map("mapViewDiv", {
    basemap: app.basemap,
    center: app.center,
    zoom: app.zoom
  });
  app.map.on("load", function(){
    app.initialExtent = app.map.extent;
  })

  // Search
  app.searchDivNav = createSearchWidget("searchNavDiv");
  app.searchWidgetPanel = createSearchWidget("searchPanelDiv");
  function createSearchWidget(parentId) {
    var search = new Search({
      map: app.map,
      enableHighlight: false
      }, parentId);
    search.startup();
    return search;
  }
  // Basemaps
  query("#selectBasemapPanel").on("change", function(e){
    app.map.setBasemap(e.target.options[e.target.selectedIndex].value);
  });
  // Home
  query(".calcite-navbar .navbar-brand").on("click", function(e) {
    app.map.setExtent(app.initialExtent);
  })
});
