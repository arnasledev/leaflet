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

  // todo transform parsed info to use as it states and not random generated one
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

    if (ufoInTheSky[data.name].marker) {
      mymap.removeLayer(ufoInTheSky[data.name].marker);
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

      let template = `<div style="text-align: left; font-size: xx-small;">`;
      template += `Stuff: lorem<br />`;
      template += `Stuff2: ipsum<br />`;
      template += `Stuff3: dolar<br />`;
      template += `Stuff4: sit<br />`;
      template += `Stuff5: amet<br />`;
      template += `</div>`;

      ufoInTheSky[data.name].marker.bindPopup(
        template,
        {
          opacity: 0.5,
          permanent: true,
          className: 'my-label',
          offset: [0, 0]
        }
      );
    }
  }

  if (currentObjectId < 20) {
    currentObjectId++;
    return setTimeout(moveObjects, 2500);
  }
};

init();
moveObjects();