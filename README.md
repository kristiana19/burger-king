# Burger King I-Spy MVP 🍟🍔

A minimal hidden-object web game built with Next.js and HTML Canvas.
Users can explore a large scene by dragging and attempt to find the hidden item.

---

## Live Demo

https://burger-king-game.onrender.com

## How to run

1. Install dependencies:
   npm install

2. Start development server:
   npm run dev

3. Open:
   http://localhost:3000

---

## How to replace assets

Replace images inside the /public folder:
- background.webp
- crown.png

If filenames change, update them inside `ISpyGame.tsx`.

---

## Adjusting item position

The hidden item position is controlled inside:
`randomizeItemPosition()` in `ISpyGame.tsx`.

Coordinates are defined in image space (not viewport space).

---

## Asset Source

Background and item assets were provided as part of the task.
All visuals are used for demonstration purposes only.