document.addEventListener("DOMContentLoaded", function () {
    var map3 = L.map('map3').setView([38.088497, -97.675321], 3.5);

    // Add Mapbox tile layer for map3
    L.tileLayer('https://api.mapbox.com/styles/v1/lohses/cm7ci445c006301so30x77itk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibG9oc2VzIiwiYSI6ImNtNnY0Ymt2aDA0cHkya3B5ZjZiMDFhbHUifQ.PbnaeqC0tz5auhy5sqjA5w', {
        attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 17,
        tileSize: 512,
        zoomOffset: -1,
    }).addTo(map3);

    // Add state boundaries layer (Ensure that `statesData` is defined correctly)
    if (typeof statesData !== "undefined") {
        L.geoJSON(statesData, {
            style: function (feature) {
                return {
                    color: "#ff10f0",   // Neon pink outline
                    weight: 0.8,
                    opacity: 0.7,
                    fillColor: "transparent",
                    fillOpacity: 0
                };
            }
        }).addTo(map3);
    } else {
        console.error("statesData is not loaded!");
    }

    var geoJsonLayer; // Variable to store the GeoJSON layer

    // Function to calculate radius based on zoom level, keeping the size in a reasonable range
    function getRadius(zoomLevel) {
        var baseRadius = 1;  // Smaller initial radius for the points when the map is first opened
        var zoomMultiplier = 0.5; // Smaller multiplier to keep the points smaller
        var radius = baseRadius + (zoomLevel - 4) * zoomMultiplier;

        // Ensure the radius doesn't get too small or too large
        radius = Math.max(1, Math.min(12, radius)); // Minimum of 1, maximum of 12
        return radius;
    }

    // Fetch and process the new GeoJSON file
    fetch('data/2020US_corrections.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.type === "FeatureCollection" && data.features) {
                // Create GeoJSON layer
                geoJsonLayer = L.geoJSON(data, {
                    pointToLayer: function (feature, latlng) {
                        var radius = getRadius(map3.getZoom());  // Get the radius based on current zoom level
                        return L.circleMarker(latlng, {
                            radius: radius,
                            fillColor: "#9D00FF", // Neon pink fill
                            color: "#9D00FF",     // Neon pink outline
                            weight: 0.25,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    },
                    onEachFeature: function (feature, layer) {
                        // Only bind popup if zoom level is greater than or equal to 4.5
                        var zoomLevel = map3.getZoom();  // Use map3.getZoom() to get zoom level for map3
                        if (zoomLevel >= 4.5) {
                            let popupContent = `
                                <div style="font-family: 'Times New Roman', serif;">
                                    <strong>State:</strong> ${feature.properties.statename}<br>
                                    <strong>Block:</strong> ${feature.properties.block}<br>
                                    <strong>Click to see <a href="${feature.properties.URL}" target="_blank" style="color: #ff10f0;">2020 Census Data</a></strong><br>
                                </div>
                            `;
                            layer.bindPopup(popupContent);
                        } else {
                            // Remove the popup if zoom is less than 4.5
                            layer.unbindPopup();
                        }
                    }
                });

                // Initially add the layer to map3
                geoJsonLayer.addTo(map3);

                // Update the size of the points on zoom
                map3.on('zoom', function () {
                    geoJsonLayer.eachLayer(function (layer) {
                        var radius = getRadius(map3.getZoom());  // Get updated radius based on current zoom level
                        layer.setRadius(radius);  // Update the radius of the marker

                        // Re-bind popups if zoom level is 4.5 or more
                        var zoomLevel = map3.getZoom();
                        if (zoomLevel >= 4.5) {
                            var popupContent = `
                                <div style="font-family: 'Times New Roman', serif;">
                                    <strong>State:</strong> ${layer.feature.properties.statename}<br>
                                    <strong>Block:</strong> ${layer.feature.properties.block}<br>
                                    <strong>Click to see <a href="${layer.feature.properties.URL}" target="_blank" style="color: #ff10f0;">2020 Census Data</a></strong><br>
                                </div>
                            `;
                            layer.bindPopup(popupContent);
                        } else {
                            layer.unbindPopup(); // Remove popup if zoom is less than 4.5
                        }
                    });
                });
            } else {
                console.error("Invalid GeoJSON format!");
            }
        })
        .catch(error => console.error("Error loading GeoJSON:", error));

    // Toggle button functionality
    document.getElementById("toggleLayer").addEventListener("click", function () {
        if (geoJsonLayer) {
            if (map3.hasLayer(geoJsonLayer)) {
                map3.removeLayer(geoJsonLayer);
                this.textContent = "Show Facilities";
            } else {
                geoJsonLayer.addTo(map3);
                this.textContent = "Hide Facilities";
            }
        }
    });
});
