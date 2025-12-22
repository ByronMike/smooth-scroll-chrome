# Smooth Scroll Chrome

A Chrome extension for automatically scrolling song lyrics, music partitions, and any scrollable content at adjustable speeds. Perfect for musicians who need hands-free scrolling while playing.

## Features

- **Auto-scroll any element** - Works on the main page and embedded scrollable containers (iframes, divs with overflow)
- **Floating widget** - Draggable on-page control panel that stays where you put it
- **Speed presets** - Quick access to Slow (0.2x), Medium (0.4x), and Fast (0.6x) speeds
- **Fine-tuning slider** - Adjust speed from 0.1x to 1x for precise control
- **Element selector** - Click to select which scrollable area to auto-scroll
- **Play/Pause/Stop controls** - Full playback-style control
- **Persistent settings** - Widget position saved between sessions

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/smooth-scroll-chrome.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top right corner)

4. Click **Load unpacked**

5. Select the `smooth-scroll-chrome` folder

6. The extension icon should appear in your toolbar

## Usage

### Floating Widget

The floating widget appears on every page and provides quick access to all controls:

- **Play/Pause button** - Start or pause auto-scrolling
- **Stop button** - Stop scrolling and reset to top
- **Speed presets** - Click Slow, Med, or Fast for preset speeds
- **Speed slider** - Fine-tune the scroll speed (0.1x to 1x)
- **Select Element** - Click to choose a specific scrollable container
- **Minimize** - Collapse the widget to save screen space

### Popup

Click the extension icon to access controls from the popup:

- Toggle scrolling on/off
- Adjust speed presets and slider
- Show/hide the floating widget

### Selecting Embedded Scrollable Elements

1. Click the **Select Element** button on the widget
2. Hover over the page - scrollable elements will be highlighted
3. Click on the element you want to auto-scroll
4. The widget will now control that specific element

## Project Structure

```
smooth-scroll-chrome/
├── manifest.json           # Extension configuration (Manifest V3)
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup logic
├── content/
│   ├── content.js          # Core scrolling logic
│   ├── content.css         # Widget styles
│   └── widget.js           # Floating widget component
├── background/
│   └── service-worker.js   # Background service worker
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Contributing

Contributions are welcome! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test the extension locally in Chrome
5. Commit your changes: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `style:` - Code style/formatting
- `docs:` - Documentation
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Ideas for Contributions

- [ ] Keyboard shortcuts for play/pause/speed control
- [ ] Remember scroll target per domain
- [ ] Custom speed presets
- [ ] Sync settings across devices
- [ ] Dark/light theme toggle for widget
- [ ] Localization support
- [ ] Firefox/Edge port

### Development Tips

- After making changes, go to `chrome://extensions/` and click the refresh icon on the extension card
- Use Chrome DevTools to debug content scripts (inspect the page, not the popup)
- Check the Console for any errors from `SmoothScrollChrome`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for musicians who need hands-free scrolling
- Inspired by the need to read music partitions and lyrics while playing
