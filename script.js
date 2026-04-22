const map = L.map("map").setView([39.75, -105.3], 9);

const cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; CartoDB" }
);

const hillshade = L.tileLayer(
  "https://tiles.openstreetmap.us/raster/hillshade/{z}/{x}/{y}.png",
  {
    opacity: 0.9, // 🔑 key for blending
    attribution: "&copy; OpenStreetMap US"
  }
);

const esriTerrain = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

const Stadia_StamenTerrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const OpenStreetMap_CH = L.tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png', {
	//maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	//bounds: [[45, 5], [48, 11]]
});

const OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

/* base.addTo(map); */
/* hillshade.addTo(map); */
/* Stadia_StamenTerrain.addTo(map); */
Esri_WorldImagery.addTo(map);

const baseMaps = {
  "Light Map": cartoLight,
  "Satellite": Esri_WorldImagery,
  "Shaded Terrain": OpenStreetMap_CH,
  "Topographic": OpenTopoMap
};

L.control.layers(baseMaps).addTo(map);

const allRoutes = L.featureGroup();

//-----------------------------------------------------------------

const bikeRouteFiles = [
    {
        file: "./routes/five-points-sloans-lake-040826.gpx",
        name: "Five Points to Sloan's Lake",
        date: "April 8, 2026"
    },
    {
        file: "./routes/green-mountain-033026.gpx",
        name: "Green Mountain",
        date: "March 30, 2026"
    },
    {
        file: "./routes/bear-creek-040226.gpx",
        name: "Bear Creek",
        date: "May 2, 2026"
    },
    {
        file: "./routes/bear-creek-030426.gpx",
        name: "Green Mountain",
        date: "May 4, 2026"
    },
    {
        file: "./routes/jeff-park-golden-080425.gpx",
        name: "Jeff Park to Golden",
        date: "October 3, 2025"
    },
    {
        file: "./routes/green-mountain-bear-creek-030926.gpx",
        name: "Green Mountain to Bear Creek",
        date: "March 9, 2026"
    },
    {
        file: "./routes/jeff-park-wash-park-031126.gpx",
        name: "Jeff Park to Wash Park",
        date: "March 9, 2026"
    },
    {
        file: "./routes/arsenal-refuge-031426.gpx",
        name: "Arsenal National Wildlife Refuge",
        date: "March 14, 2026"
    },
    {
        file: "./routes/buffalo-creek-041126.gpx",
        name: "Buffalo Creek Lollipop",
        date: "April 11, 2026"
    },
    {
        file: "./routes/waterton-canyon-high-canal-041226.gpx",
        name: "Waterton Canal and High Line Canal Loop",
        date: "April 12, 2026"
    },
    {
        file: "./routes/jeff-park-golden-042126.gpx",
        name: "Jeff Park Clear Creek",
        date: "April 12, 2026"
    }

];

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = deg => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getSpeedColor(mps) {
    const mph = mps * 2.23694;

    if (mph < 8) return "blue";
    if (mph < 13) return "green";
    if (mph < 20) return "orange";
    return "red";
}

async function loadRoute(route, name, date) {
    try {
        const response = await fetch(route);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const gpxText = await response.text();

        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, "application/xml");

        const trkpts = [...gpxDoc.getElementsByTagName("trkpt")];

        if (trkpts.length < 2) {
            throw new Error("Not enough track points found in GPX");
        }

        const points = trkpts.map((pt) => {
            const lat = parseFloat(pt.getAttribute("lat"));
            const lon = parseFloat(pt.getAttribute("lon"));
            const timeText = pt.getElementsByTagName("time")[0]?.textContent;

            return {
                lat,
                lon,
                time: timeText ? new Date(timeText) : null
            };
        }).filter(p => !Number.isNaN(p.lat) && !Number.isNaN(p.lon));

        const routeGroup = L.featureGroup();

        for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];

            if (!p1.time || !p2.time) continue;

            const seconds = (p2.time - p1.time) / 1000;
            if (seconds <= 0) continue;

            const meters = haversine(p1.lat, p1.lon, p2.lat, p2.lon);
            const speedMps = meters / seconds;
            const speedMph = speedMps * 2.23694;

            const segment = L.polyline(
                [
                    [p1.lat, p1.lon],
                    [p2.lat, p2.lon]
                ],
                {
                    color: getSpeedColor(speedMps),
                    weight: 9,
                    opacity: 0.9
                }
            ).bindTooltip(`   
                <div>
                    <div><strong>Ride:</strong> ${name}</div>
                    <div><strong>Date:</strong> ${date}</div>
                    <div><strong>Speed:</strong> ${speedMph.toFixed(1)} mph</div>
                </div>
            `)

            routeGroup.addLayer(segment);
        }

        routeGroup.addTo(map);
        allRoutes.addLayer(routeGroup);

        console.log("Track points loaded:", points.length);
    } catch (error) {
        console.error("Error loading GPX:", error);
    }
}

async function initBikeRoutes() {
    await Promise.all(
    bikeRouteFiles.map(route =>
        loadRoute(route.file, route.name, route.date)
    )
    );
}

initBikeRoutes();
