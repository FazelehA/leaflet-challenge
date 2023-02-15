// Creating the map object
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 6
 
});

// Define variables for our tile layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

street.addTo(myMap);

// Only one base layer can be shown at a time.
var baseMaps = {
  "Street Map": street,
  "Topographic Map": topo
};

var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

var overlays = {
  "Tectonic Plates": tectonicplates,
  "Earthquake": earthquakes
};


L.control.layers(baseMaps, overlays).addTo(myMap);


// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Function to determine marker size 
function markerSize(magnitude) {
  return magnitude * 20000;
}

// Function to determine marker color
function chooseColor(depth) {
  if (depth < 10) return "#FFBF00";
  else if (depth < 30) return "#EF820D";
  else if (depth < 50) return "#EB9606";
  else if (depth < 70) return "#B1560F";
  else if (depth < 90) return "#793802";
  else return "#7C4700";
};
  

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Creating a GeoJason layer with retrieved data
  L.geoJson(data, {
    pointToLayer: function(feature,latlng){
    return L.circle(latlng, {
      radius: markerSize(feature.properties.mag),
      color: "#000000",
      fillColor: chooseColor(feature.geometry.coordinates[2]),
      fillOpacity: 0.75,
      weight: 0.5
     });
    },

    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
    
    
    
  }).addTo(earthquakes);
  
  earthquakes.addTo(myMap);

  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [10, 30, 50, 70, 90];
    var colors = [
      "#FFBF00",
      "#EF820D",
      "#EB9606",
      "#B1560F",
      "#793802",
      "#7C4700"];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + grades[i]
        + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(myMap);

  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
    
  L.geoJson(platedata, {
    color: "red",
    weight: 3
  }).addTo(tectonicplates);

  tectonicplates.addTo(map);
});


});
