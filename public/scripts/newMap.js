
mapboxgl.accessToken = mapToken;

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    types: 'country,region,place,postcode,locality,neighborhood,poi'
    });

geocoder.addTo('#geocoder');

const locationHandler = document.getElementById('location');
const longHandler = document.getElementById('longitude');
const latHandler = document.getElementById('latitude');

geocoder.on('result', (e) => {
    let center = (e.result.center);
    let locationName = (e.result.place_name)
    longHandler.value = center[0];
    latHandler.value = center[1];
    locationHandler.value = locationName;
    });