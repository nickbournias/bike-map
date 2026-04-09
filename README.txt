# 🚴‍♂️ Nick's Bike Map

A simple, interactive bike map built with Leaflet that visualizes ride data from GPX files. Routes are color-coded by speed, giving a quick visual sense of how each ride played out.

---

## 🔍 Overview

This project loads GPX files and renders them on an interactive map centered around the Denver area.

Each ride is split into segments and styled dynamically based on speed:

* 🟦 **Slow** — Blue
* 🟩 **Moderate** — Green
* 🟧 **Fast** — Orange
* 🟥 **Very Fast** — Red

Hovering over any segment reveals ride details like name, date, and speed.

---

## ⚙️ Tech Stack

* **Leaflet.js** — Map rendering
* **Vanilla JavaScript** — Data parsing and logic
* **GPX (XML)** — Ride data source
* **HTML/CSS** — Layout and styling

---

## 🗺️ Features

* Multiple base map layers (light + satellite)
* GPX route parsing using native browser APIs
* Speed-based color visualization
* Interactive tooltips with ride metadata
* Clean, centered UI with a custom background
* Smooth map animation on load

---

## 🚀 How It Works

1. The map initializes using Leaflet and loads a base layer
2. GPX files are fetched and parsed as XML
3. Each track point is processed to:

   * Calculate distance (Haversine formula)
   * Calculate speed between points
4. Route segments are drawn and styled based on speed
5. All routes are grouped and displayed on the map

---

If you want, I can make this even more “GitHub polished” (badges, screenshots section, demo link, etc.) or tailor it for recruiters vs hobby project vibes.
