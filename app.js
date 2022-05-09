const mapToken = "pk.eyJ1IjoibWljaGFlbHNwYXJrczEzIiwiYSI6ImNsMmRoczNjMDAwMWkzYm10dzRyb3gxenQifQ.56aTkg40fV3OsQibg27VEA"
const weatherToken = "41b54a6111754445b54a611175b44574";
mapboxgl.accessToken = mapToken;

 // set DOM elements for the current conditions info
 const weatherWidget = document.getElementById("weather");
 const cityName = document.getElementById("city-name");
 const temp = document.getElementById("temp");
 const conditions = document.getElementById("conditions");

 //create the map
const map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/dark-v10', 
    center: [-95.992775, 36.153980], 
    zoom: 4.5, 
  });

  //create and add the geocoding element
const geocoder = new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl,
});

map.addControl(geocoder);

//url for weather company request
const url = "https://api.weather.com/v3/TileServer/series/productSet/PPAcore?apiKey=" +
weatherToken
let latestTimeSlice = "";

//fxn to get weather data from api
 async function getWeatherData()  {
    const response = await fetch(url);
    const timeSlices = await response.json();

    const radarTimeSlices = timeSlices.seriesInfo.radar.series;
    latestTimeSlice = radarTimeSlices[0].ts;
}

//add the weather radar layer from the getWeatherData call
const addRadarLayer = () => {
    map.addSource("weatherRadar", {
        type: "raster",
        tiles: ["https://api.weather.com/v3/TileServer/tile/radar?ts=" +
        latestTimeSlice +
        "&xyz={x}:{y}:{z}&apiKey=" +
        weatherToken],
        tileSize: 256
    });

    map.addLayer(
        {
          id: "radar",
          type: "raster",
          source: "weatherRadar",
          paint: {
            "raster-opacity": 0.5,
          },
        },
        "aeroway-line"
      );
} 

//get current conditions from geocoder response & set to weather box using dom elements
const getCurrentConditions = async (e) => {
    
    const cityNameText = e.result.text;
    const longitude = e.result.geometry.coordinates[0];
    const latitude = e.result.geometry.coordinates[1];

    
    
    const currentConditionsURL =
      "https://api.weather.com/v1/geocode/" +
      latitude +
      "/" +
      longitude +
      "/observations.json?language=en-US&units=e&apiKey=" +
      weatherToken;

    const response = await fetch(currentConditionsURL)
    const currentConditions = await response.json();
    
    const tempText = currentConditions.observation.temp;
    const conditionsText = currentConditions.observation.wx_phrase;

    weatherWidget.style.visibility = "visible";
    cityName.innerText = cityNameText;
    temp.innerText = tempText;
    conditions.innerText = conditionsText;
  };


map.on("load", async () => {
    await getWeatherData();
    addRadarLayer();
});

geocoder.on("result", (e) => {
    getCurrentConditions(e);
  });