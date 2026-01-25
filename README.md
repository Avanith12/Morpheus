# Morpheus

**Morpheus** is an interactive 3D particle network visualization built with **Three.js**. Experience mesmerizing particle animations that morph between geometric shapes, react to audio input, and respond to user interactions in real-time.

![Morpheus Banner](https://img.shields.io/badge/Three.js-r128-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🎨 Visual Effects
- **Dynamic Particle System**: 50-500 interactive particles with customizable size and behavior
- **Bloom & Glow**: Cinematic post-processing effects with UnrealBloomPass
- **Starfield Background**: 1000+ animated stars creating depth and atmosphere
- **Particle Trails**: Optional motion trails for enhanced visual feedback
- **Rainbow Mode**: Dynamic HSL color cycling across particles
- **Connection Pulse**: Pulsing network lines between nearby particles

### 🔮 Morph Shapes
Transform particles between 9+ geometric formations:
- **Cloud**: Random 3D distribution
- **Sphere**: Fibonacci sphere distribution
- **Cube**: 3D grid formation
- **Torus**: Donut-shaped structure
- **DNA**: Double helix pattern
- **Spiral**: Galaxy-like spiral
- **Heart**: Mathematical heart shape
- **Star**: 5-pointed star outline
- **Infinity**: Lemniscate curve
- **Text**: Custom text morphing (default: "MORPHEUS")

### 🎵 Audio Reactivity
- **Microphone Input**: Real-time audio visualization
- **Dynamic Response**: Particle size and bloom intensity react to audio levels
- **Frequency Analysis**: FFT-based audio processing

### 🌈 Themes
Three carefully crafted color palettes:
- **Deep Ocean**: Cyan particles on dark blue gradient (`#00f2fe`)
- **Cyber Pulse**: Magenta particles on deep purple (`#f5576c`)
- **Frozen Void**: Teal particles on icy gradient (`#74ebd5`)

### 🎮 Interactive Controls
- **Click Particles**: Fire neural pulses that propagate through connections
- **Shift/Ctrl + Click**: Create gravity wells (attract particles)
- **Right-Click**: Create repulsion wells (push particles away)
- **Drag**: Rotate camera view with OrbitControls
- **Scroll**: Zoom in/out
- **Neural Explosion**: Scatter all particles for dramatic effect

### 🛠️ Control Panel (Tweakpane)
Full-featured GUI for real-time customization:
- **Atmosphere**: Theme, bloom glow, audio reactivity, rainbow mode
- **Geometry**: Shape morphing, custom text, particle count, size, morph speed, storm mode
- **Effects**: Trails, connection pulse, background gradient, size variation, gravity power
- **Camera**: Auto-rotation toggle
- **Actions**: Neural explosion, screenshot capture

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- No build tools required - runs directly in the browser!

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/Morpheus.git
   cd Morpheus
   ```

2. **Run locally**:
   
   **Option A: Using Live Server (VS Code)**
   - Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
   - Right-click `index.html` → "Open with Live Server"
   
   **Option B: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Option C: Using Node.js**
   ```bash
   npx http-server -p 8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000`

---

## 🎯 Usage

### Basic Interaction
1. **Launch the application** - The particle network will initialize in "Cloud" formation
2. **Open the control panel** (right side) to customize the experience
3. **Click on particles** to fire neural pulses
4. **Hold Shift/Ctrl and click-drag** to create gravity effects
5. **Try different shapes** from the Geometry panel
6. **Switch themes** to change the color palette

### Advanced Features

#### Custom Text Morphing
1. Select "Text" from the Shape dropdown
2. Enter your custom text in the "Custom Text" field
3. Watch particles morph into your text!

#### Audio Visualization
1. Enable "Audio Reactive" in the Atmosphere panel
2. Allow microphone access when prompted
3. Play music or make sounds - particles will react!

#### Screenshot Capture
- Click the "Screenshot" button to download a PNG of the current view

---

## 🎮 Controls Reference

| Action | Control | Description |
|--------|---------|-------------|
| **Fire Pulse** | Left Click | Click any particle to send signal through network |
| **Attract** | Shift + Drag | Pull particles toward cursor |
| **Repel** | Ctrl + Drag / Right Click + Drag | Push particles away from cursor |
| **Rotate Camera** | Left Click + Drag | Orbit around the scene |
| **Zoom** | Mouse Wheel | Zoom in/out |
| **Reset Camera** | Auto-rotate (toggle in panel) | Automatic rotation |

---

## 🏗️ Technical Stack

### Core Technologies
- **Three.js (r128)**: 3D graphics rendering
- **OrbitControls**: Camera manipulation
- **EffectComposer**: Post-processing pipeline
- **UnrealBloomPass**: Glow effects
- **Tweakpane (3.0.7)**: GUI controls

### Architecture
- **Particle System**: BufferGeometry with custom attributes (position, color, velocity)
- **Connection System**: LineSegments for inter-particle connections
- **Animation Loop**: requestAnimationFrame-based render loop
- **Audio Processing**: Web Audio API with AnalyserNode

### File Structure
```
Morpheus/
├── index.html          # Main HTML entry point
├── app.js              # Core application logic (679 lines)
├── style.css           # Styling and theming
├── README.md           # Documentation
└── .git/               # Version control
```

---

## 🎨 Customization Guide

### Adding New Shapes
Edit the `morphTargets` object in `app.js`:

```javascript
morphTargets.MyShape = (i, total) => {
  // Return THREE.Vector3 for particle position
  return new THREE.Vector3(x, y, z);
};
```

### Creating New Themes
Add to the `themes` object:

```javascript
'My Theme': {
  node: 0xRRGGBB,           // Particle color (hex)
  bg: '#RRGGBB',            // Solid background
  gradientTop: '#RRGGBB',   // Top gradient color
  gradientBottom: '#RRGGBB' // Bottom gradient color
}
```

### Adjusting Particle Behavior
Modify the `config` object to change defaults:
```javascript
const config = {
  count: 250,              // Number of particles (50-500)
  pointSize: 4.0,          // Base particle size
  bloomStrength: 1.5,      // Glow intensity
  morphSpeed: 0.03,        // Shape transition speed
  gravityStrength: 2.0,    // Gravity well power
  // ... more options
};
```

---

## 🐛 Known Limitations

- Audio reactivity requires microphone permissions
- Performance may vary on lower-end devices (reduce particle count if needed)
- Text morphing works best with short words (1-10 characters)
- Trails are limited to 50 concurrent instances for performance

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:
- Add new morph shapes (e.g., galaxy, atoms, molecules)
- Implement save/load presets
- Add WebGL shader effects
- Mobile touch controls optimization
- VR/AR support

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D library
- **Tweakpane** - Elegant GUI controls
- **UnrealBloomPass** - Stunning glow effects

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the Tweakpane controls for available options
- Ensure your browser supports WebGL 2.0

---

**Built with ❤️ by Avanith**

*"The mind is everything. What you think you become." - Buddha*
