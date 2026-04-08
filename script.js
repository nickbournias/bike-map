const map = L.map("map").setView([39.75, -105.1], 11);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; CartoDB"
}).addTo(map);

const routeFiles = [
  {
    file: "./routes/activity_22059571622.gpx",
    name: "Sloan's Lake Ride"
  },
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

  if (mph < 6) return "blue";
  if (mph < 10) return "green";
  if (mph < 14) return "orange";
  return "red";
}

async function loadRoute() {
  try {
    const response = await fetch("./routes/activity_22059571622.gpx");

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
      ).bindTooltip(`${speedMph.toFixed(1)} mph`);

      routeGroup.addLayer(segment);
    }

    routeGroup.addTo(map);

    if (routeGroup.getBounds().isValid()) {
      map.fitBounds(routeGroup.getBounds());
    } else {
      throw new Error("Route bounds are invalid");
    }

    console.log("Track points loaded:", points.length);
  } catch (error) {
    console.error("Error loading GPX:", error);
  }
}

loadRoute();