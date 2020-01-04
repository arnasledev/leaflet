// leaflet map object with lithuania coordination
const mymap = L.map('mapid').setView([40.4637, -2.7492], 6.35)
// layer that must be included to the map object in order to update data on it
const aircraftlayer = L.layerGroup().addTo(mymap)
// leaflet library access token to manipulate given data
const leafLeatAccessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

// information where all planes should be dropped (start position)
const fixedLocation = {
    latitude: {
        min: 39.00,
        max: 42.00
    },
    longtitude: {
        min: -4.00,
        max: 0.00
    }
}

// object of current planes in the sky
const ufoInTheSky = {}

// we need to know which positions file to read since we are looping trough it
let currentObjectId = 1

// method to init map actions, planes actions
const init = () => {
    // adding scale buttons to the map
    L.control.scale({ imperial: false }).addTo(mymap)
    // initiating map layer with given properties {maxZoom, id} and adding this layer to our map
    L.tileLayer(
        `https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${leafLeatAccessToken}`,
        {
            maxZoom: 18,
            id: 'mapbox.streets'
        }
    ).addTo(mymap)
}

// method to read the files where planes positions is being stored
const readFile = file => {
    return $.get(`https://raw.githubusercontent.com/arnasledev/leaflet/master/data/${file}`,
        data => {
            return data
        })
}

// method to move our planes
const moveObjects = async () => {
    // object to get random integer to add on plane starting position
    const intToAdd = {
        latitude: Math.random() * (0.09 - -0.05) + -0.05,
        longtitude: Math.random() * (0.09 - -0.05) + -0.05
    }

    // reading the file info to retrieve new coordinates for our plane. we stop to move the planes if we can't read the file.
    let objectInfo
    try {
        objectInfo = await readFile(`${currentObjectId}.txt`)
    }
    catch (e) {
        // print message to console to see the error why it stopped
        return console.log(`Unable to read ${currentObjectId}.txt`, e.message)
    }

    // todo transform parsed info to use as it states and not random generated one
    objectInfo = JSON.parse(objectInfo)
    // objectInfo contains array of planes positions and more, we are looping trough it
    for (const key in objectInfo) {
        // adding static data to object so we would never use objectInfo[key].track_mode_3a again
        const data = {
            name: objectInfo[key].track_mode_3a // our plane identifier
        }

        // we should add the plane to our already created planes in the sky object if this is a new plane
        if (!ufoInTheSky[data.name]) {
            // get random data where to drop the plane and set it to our object
            const latitude = Math.random() * (fixedLocation.latitude.max - fixedLocation.latitude.min) + fixedLocation.latitude.min
            const longtitude = Math.random() * (fixedLocation.longtitude.max - fixedLocation.longtitude.min) + fixedLocation.longtitude.min

            // set the random data for specific plane
            ufoInTheSky[data.name] = { marker: null, latitude, longtitude }
        } else {
            // the plane was already in the sky so we just need to move it a bit and save the information
            // we are adding random length to move the object since we already created it before
            ufoInTheSky[data.name].latitude = ufoInTheSky[data.name].latitude + intToAdd.latitude
            ufoInTheSky[data.name].longtitude = ufoInTheSky[data.name].longtitude + intToAdd.longtitude
        }

        // this will remove the existing marker for the plane if its an old plane
        if (ufoInTheSky[data.name].marker) {
            mymap.removeLayer(ufoInTheSky[data.name].marker)
        }

        // we will not move it in case the plane info was incorrect
        if (ufoInTheSky[data.name].latitude && ufoInTheSky[data.name].longtitude) {
            // create the marker object (move the plane to specified location)
            ufoInTheSky[data.name].marker = L.circleMarker(
                [ufoInTheSky[data.name].latitude, ufoInTheSky[data.name].longtitude],
                {
                    color: 'black', // parameter to set the marker color
                    opacity: 0.5, // parameter to set the marker opacity
                    radius: 5 // parameter to set how round the marker should be
                }
            ).addTo(aircraftlayer) // add the created marker to our layer

            // create text info layer (html code)
            let template = `<div style="text-align: left; font-size: xx-small;">`
            template += `Stuff: lorem<br />`
            template += `Stuff2: ipsum<br />`
            template += `Stuff3: dolar<br />`
            template += `Stuff4: sit<br />`
            template += `Stuff5: amet<br />`
            template += `</div>`

            // set created text layer to our marker to see the info if we hover the mouse there
            ufoInTheSky[data.name].marker.bindPopup(
                template,
                {
                    opacity: 0.5,
                    permanent: true,
                    className: 'my-label',
                    offset: [0, 0]
                }
            )
        }
    }

    // we are retrieving the next file for new coordinates and planes since we know there are 20 files only
    if (currentObjectId < 20) {
        currentObjectId++
        return setTimeout(moveObjects, 2500) // add 2.5s delay before calling the same method to move planes
    }
}

init() // call init method as the map.js file loads
moveObjects() // call method to add planes and move it as the map.js file loads