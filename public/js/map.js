let coords = [
    listing.geometry.coordinates[1],
    listing.geometry.coordinates[0]
];

const map = L.map('map').setView(coords, 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

L.marker(coords)
.addTo(map)
.bindPopup("Exact location provided after booking.")
.openPopup();

L.circle(coords,{
    color:'#ff385c',
    fillColor:'#ff385c',
    fillOpacity:0.2,
    radius:500
}).addTo(map);