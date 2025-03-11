var map2 = L.map('map2').setView([38.886896, -96.046676], 4);

// Set the base map using Esri World Gray Canvas
var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
}).addTo(map2);

// Fetch the new 50-year prison population data
fetch('data/new50ypp.geojson')
    .then(response => response.json())
    .then(prisonData => {
        console.log('New 50-Year Prison Population Data:', prisonData);

        // Function to calculate prison population rate per 100,000 residents (1980 data)
        function getPrisonRate(feature) {
            const totalPop = feature.properties.TP1980 || 1; // Avoid division by zero
            const prisonPop = feature.properties.PP1980 || 0;
            return Math.round((prisonPop / totalPop) * 100000); // Round to the nearest whole number
        }

        // Function to style states based on 1980 prison population rate
        function style(feature) {
            const rate = getPrisonRate(feature);
            return {
                fillColor: getColor(rate),  
                weight: 1.5,  // White border thickness
                opacity: 1,  
                color: '#ffffff',  // White border color
                fillOpacity: 0.7  
            };
        }

        function getColor(rate) {
            return rate > 500 ? '#08306b' : // Dark Blue
                   rate > 250 ? '#2171b5' : // Medium Blue
                   rate > 125 ? '#3690c0' : // Teal
                   rate > 50  ? '#a6d854' : // Light Green
                                '#ffffb2';  // Light Yellow
        }

        // Add the GeoJSON data with calculated 1980 prison rates
        L.geoJson(prisonData, {
            style: style,
            onEachFeature: function (feature, layer) {
                const prisonPop = feature.properties.PP1980;
                const totalPop = feature.properties.TP1980;
                const rate = getPrisonRate(feature);
        
                // Format the numbers with commas
                const formattedPrisonPop = prisonPop.toLocaleString();
                const formattedTotalPop = totalPop.toLocaleString();
                const formattedRate = rate.toLocaleString();
        
                layer.bindPopup(
                    `<b>${feature.properties.NAME}</b><br>
                     <b>Prison Population:</b> ${formattedPrisonPop}<br>
                     <b>Total Population:</b> ${formattedTotalPop}<br>
                     <b>Rate per 100,000:</b> ${formattedRate}`
                );
            }
        }).addTo(map2);

        // Add legend
        var legend2 = L.control({ position: 'bottomleft' });

        legend2.onAdd = function (map2) {
            var div = L.DomUtil.create('div', 'legend2'); // Using legend2 class
            var grades = [0, 50, 125, 250, 500];  // Adjusted grades based on new thresholds


            div.innerHTML = '<b>Population Rate<br>per 100,000</b><br>';  // Break title into two lines

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    `<div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <i style="background:${getColor(grades[i] + 1)}; width: 20px; height: 20px; display: inline-block;"></i>
                        <span style="margin-left: 8px;">${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] : '+'}</span>
                    </div>`;
            }

            return div;
        };

        legend2.addTo(map2);

        // Add instruction text to the top-right corner of the map without a box
        var instructions = L.control({ position: 'topright' });

        instructions.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'instructions');
            div.innerHTML = '1980 Prison Population Data'; 
            div.style.fontSize = '18px'; // Increase font size
            div.style.fontFamily = 'Georgia, serif'; // Set font family
            div.style.color = '#08306b'; // Set text color
            div.style.fontWeight = 'bold'; // Make text bold
            div.style.textAlign = 'center'; // Center text
            div.style.width = '100%'; // Ensure it spans full width for centering
            div.style.display = 'block'; // Ensure block display for proper alignment
            div.style.padding = '5px 0'; // Add slight padding for spacing
            div.style.backgroundColor = 'transparent'; // Keep background transparent
            div.style.boxShadow = 'none'; // Remove box shadow
            return div;
        };

        instructions.addTo(map2);
    })
    .catch(error => console.error('Error loading new 50-year prison population data:', error));
