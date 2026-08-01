# Vastu Muhurat Predictor

A premium, modern, responsive web application for predicting Vastu Muhurat suitability for starting house construction or moving into a new home (Griha Pravesh) based on the five limbs of Panchang (Tithi, Nakshatra, Vaar, Yoga, Karan).

Predictions are generated dynamically using the Gemini 1.5 Flash API.

---

## Features

1. **Astrological Input Selection:** Select combinations of:
   - **Tithi** (Lunar day)
   - **Nakshatra** (Lunar mansion)
   - **Vaar** (Weekday)
   - **Yoga** (Luni-solar combination)
   - **Karan** (Half of a Tithi)
2. **Dynamic Classical Indian Astrology Evaluation:** Instantly view whether selected components are auspicious or restricted, with built-in classical rules highlighted right below each picker.
3. **Cosmic / Glassmorphic Premium UI:** Features dark space backgrounds, golden starry accents, radial progress indicators, glowing borders, and fully responsive layouts that fit perfectly on mobile phones, tablets, or laptops.
4. **Device-Specific Credit Limit:** Each device is granted **3 credits** by default, stored in `localStorage`. Once exhausted, further predictions are locked until reset.
5. **Developer Configuration Panel:** A gear icon in the bottom right opens a secure configurations modal allowing:
   - Resetting device credits to 3.
   - Updating or changing the Gemini API key.

---

## Technical Stack

- **Core:** React 19, TypeScript
- **Bundler & Server:** Vite 8
- **Styling:** Custom Vanilla CSS (Cosmic/Midnight themes, responsive flex/grid structure)
- **Icons:** Lucide React

---

## Getting Started

### 1. Run Development Server
To run the local server on your machine:
```bash
npm run dev
```

### 2. Build for Production
To generate optimized production bundle files (in the `dist/` directory):
```bash
npm run build
```

### 3. Preview Production Build
To spin up a local preview server for the compiled production files:
```bash
npm run preview
```
