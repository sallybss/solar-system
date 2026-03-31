# Interactive Solar System

A Three.js prototype of the Solar System built for a visualisation assignment.

Live demo: https://solar-system-kkh4.onrender.com

This project presents an interactive 3D solar system with:
- the Sun and all 8 planets
- orbit animation
- clickable planet labels
- a fact card for each planet and the Sun
- camera controls with `OrbitControls`
- a small control panel for orbit speed, labels, and auto focus

The project is a prototype, not a scientifically exact simulation. The goal is to demonstrate a clear concept, basic interaction, and a working Three.js visualisation.

## Project Goal

The purpose of this project is to create a demo visualisation using Three.js examples and basic functionality.  
This prototype focuses on:
- building a complete 3D scene
- animating planets around the Sun
- allowing the user to explore the system
- showing information through interactive UI elements

## Features

- Sun included as a selectable object
- Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune
- orbit rings for each planet
- floating labels for celestial bodies
- fact card with multiple interesting facts
- GUI controls for:
  - orbit speed
  - planet labels on/off
  - auto focus on selected object
- responsive overlay UI

## Tech Stack

- `Three.js`
- `Vite`
- `lil-gui`
- plain JavaScript
- plain CSS

## How To Run

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Controls

- Drag with the mouse to rotate the camera
- Scroll to zoom in and out
- Click a planet label to select that object
- Click a planet or the Sun directly in the scene to open its fact card
- Use the button in the fact card to cycle through more facts

## Project Structure

- [index.html](/Users/Sali/Desktop/solar-system-project/index.html)
  Main HTML structure and overlay containers
- [src/main.js](/Users/Sali/Desktop/solar-system-project/src/main.js)
  Three.js scene setup, planet generation, animation, labels, selection, and fact logic
- [src/style.css](/Users/Sali/Desktop/solar-system-project/src/style.css)
  Layout and UI styling

## Notes About Realism

This project does not use downloaded 3D planet models.  
Instead, it uses:
- sphere geometries for planets
- procedural texture-like color bands
- simple atmospheric glow effects
- ring geometry for Saturn and Uranus

If more realism is needed later, the next improvements would be:
- real NASA texture maps
- moon systems
- asteroid belt
- bump or normal maps
- better planetary scale tuning


## Author Notes

This project is designed as a prototype for demonstration and learning purposes.  
It prioritises interaction, clarity, and presentation value over scientific precision.
