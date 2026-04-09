const map = L.map("map").setView([39.75, -105.1], 11);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; CartoDB"
}).addTo(map);

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
                    weight: 5,
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

        /* if (routeGroup.getBounds().isValid()) {
          map.fitBounds(routeGroup.getBounds());
        } else {
          throw new Error("Route bounds are invalid");
        } */

        console.log("Track points loaded:", points.length);
    } catch (error) {
        console.error("Error loading GPX:", error);
    }
}

/* loadRoute(bikeRouteFiles[0].file, bikeRouteFiles[0].name);
loadRoute("./routes/green-mountain-033026.gpx"); */

async function initBikeRoutes() {
    for (const route of bikeRouteFiles) {
        await loadRoute(route.file, route.name, route.date);
    }
}

initBikeRoutes();
