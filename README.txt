🚴‍♂️ Nick's Bike Map

A simple interactive bike map built with Leaflet that visualizes ride data from GPX files. Routes are displayed with color-coded segments based on speed, giving a quick visual feel for how each ride played out.

🔍 Overview

This project loads GPX files and renders them on an interactive map centered around the Denver area. Each ride is broken into segments and styled dynamically based on speed.

🟦 Slow = Blue
🟩 Moderate = Green
🟧 Fast = Orange
🟥 Very Fast = Red

Hovering over a segment shows ride details like name, date, and speed.

⚙️ Tech Stack
Leaflet.js – Map rendering
Vanilla JavaScript – Data parsing + logic
GPX (XML) – Ride data source
HTML/CSS – Layout and styling

🗺️ Features
Multiple base map layers (light + satellite)
GPX route parsing using native browser APIs
Speed-based color visualization
Tooltips with ride metadata
Clean, centered UI with a custom background
Smooth map animation on load

🚀 How It Works
The map initializes using Leaflet and loads a base layer.
GPX files are fetched and parsed as XML.
Each track point is processed to:
Calculate distance (Haversine formula)
Calculate speed between points
Route segments are drawn and styled based on speed.
All routes are added to a feature group and displayed.