const mymap = L.map('mapid').setView([55.1, 23.0], 7.4);
const aircraftlayer = L.layerGroup().addTo(mymap);
const markeriai = L.layerGroup().addTo(mymap);
const leafLeatAccessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const fixedLocation = {
  latitude: {
    min: 54.00,
    max: 56.00
  },
  longtitude: {
    min: 23.00,
    max: 25.00
  }
};
const ufoInTheSky = {};

let currentObjectId = 1;
let objectsInterval = null;

const init = () => {
  L.control.scale({ imperial: false }).addTo(mymap);
  L.tileLayer(
    `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${leafLeatAccessToken}`,
    {
      maxZoom: 18,
      id: 'mapbox.streets'
    }
  ).addTo(mymap);
};

const readFile = file => {
  return $.get(`https://raw.githubusercontent.com/arnasledev/leaflet/master/data/${file}`, data => {
    return data;
  });
};

const moveObjects = async () => {
  const intToAdd = {
    latitude: Math.random() * (0.09 - -0.05) + -0.05,
    longtitude: Math.random() * (0.09 - -0.05) + -0.05
  };

  let objectInfo;
  try {
    objectInfo = await readFile(`${currentObjectId}.txt`);
  }
  catch (e) {
    return console.log(`Unable to read ${currentObjectId}.txt`, e.message);
  }

  objectInfo = JSON.parse(objectInfo);
  for (const key in objectInfo) {
    const data = {
      name: objectInfo[key].track_mode_3a
    };

    if (!ufoInTheSky[data.name]) {
      const latitude = Math.random() * (fixedLocation.latitude.max - fixedLocation.latitude.min) + fixedLocation.latitude.min;
      const longtitude = Math.random() * (fixedLocation.longtitude.max - fixedLocation.longtitude.min) + fixedLocation.longtitude.min;

      ufoInTheSky[data.name] = { marker: null, latitude, longtitude };
    } else {
      ufoInTheSky[data.name].latitude = ufoInTheSky[data.name].latitude + intToAdd.latitude;
      ufoInTheSky[data.name].longtitude = ufoInTheSky[data.name].longtitude + intToAdd.longtitude;
    }

    if (ufoInTheSky[data.name].marker){
      mymap.removeLayer(ufoInTheSky[data.name].marker)
    }

    if (ufoInTheSky[data.name].latitude && ufoInTheSky[data.name].longtitude) {
      ufoInTheSky[data.name].marker = L.circleMarker(
        [ufoInTheSky[data.name].latitude, ufoInTheSky[data.name].longtitude],
        {
          color: 'black',
          opacity: 0.5,
          radius: 5
        }
      ).addTo(aircraftlayer);
    }
  }

  if (currentObjectId < 20) {
    currentObjectId++;
    return setTimeout(moveObjects, 2500);
  }
};

init();
moveObjects();

var marker = L.marker([55, 24], { rotationAngle: 45, opacity: 1, color: 'red' }).addTo(markeriai);
marker.bindTooltip('Test',
  { opacity: 0.5, permanent: true, className: 'my-label', offset: [0, 0] });

function drawMarkers() {
  var jsonOb = JSON.parse(request.responseText);
  aircraftlayer.clearLayers();
  for (var key in jsonOb) {

    var element = jsonOb[key];
    if (element.constructor === Array) {
      var lat = element[1];
      var lon = element[2];
      var crs = element[3];
      var alt = element[4];
      var gs = element[5];  // ground speed
      var vs = element[15]; // vertical speed
      var squawk = element[6];
      var code = element[18]; // ICAO code
      var fpl = element[13]; // flight plan no.
      var ong = element[14]; // on ground
      var y = element[17]; // ?
      if (lat != undefined && lon != undefined && crs != undefined) {
        var marker = L.circleMarker([lat, lon], { color: 'black', opacity: 0.5, radius: 5 }).addTo(
          aircraftlayer);
        marker.bindPopup('<div style="text-align: left; font-size: xx-small;">' +   // .bindTooltip
          'Crs: ' + String(crs) + '&deg;<br>' +
          'Alt: ' + alt + ' ft<br>' +
          'GS: ' + gs + ' kt<br>' +
          'VS: ' + vs + ' fpm<br>' +
          'Squawk: ' + squawk + '<br>' +
          'Code: ' + code + '<br>' +
          'FPL: ' + fpl + '<br>' +
          'On ground: ' + ong + '<br>' +
          'y: ' + y +
          '</div>', { opacity: 0.5, permanent: true, className: 'my-label', offset: [0, 0] });
      }
    }

  }
}