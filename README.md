# 🎮 Gamepad Tester

A comprehensive web-based controller testing application that can detect and test USB, Bluetooth, and wireless controllers of various types. Built with modern web technologies and the HTML5 Gamepad API.

## ✨ Features

### 🔍 Controller Detection
- **Multi-Controller Support**: Detect and test multiple controllers simultaneously
- **Connection Type Detection**: Automatically identifies USB, Bluetooth, and wireless connections
- **Real-time Status**: Live connection status with visual indicators
- **Controller Information**: Displays detailed controller specifications and capabilities

### 🎯 Input Testing
- **Button Testing**: Visual feedback for all controller buttons with real-time press detection
- **Analog Stick Testing**: Precise axis value display with visual indicators
- **Trigger Testing**: Support for analog triggers (L2/R2) with pressure sensitivity
- **D-Pad Testing**: Directional pad input detection and visualization

### 📊 System Information
- **Browser Compatibility**: Shows Gamepad API support status
- **Vibration Support**: Displays vibration API availability
- **User Agent**: System and browser information
- **Controller Mapping**: Standard vs custom mapping detection

### 🔄 Vibration Testing
- **Haptic Feedback**: Test controller vibration/rumble functionality
- **Multiple Patterns**: Different vibration intensities and durations
- **Fallback Support**: Works with both modern and legacy vibration APIs
- **Visual Feedback**: Clear indication of vibration test results

## 🚀 Getting Started

### Prerequisites
- Modern web browser with Gamepad API support
- USB, Bluetooth, or wireless controller
- HTTPS connection (required for some browser APIs)

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Connect your controller(s)
4. Press any button on your controller to activate it

### Usage

#### Connecting Controllers
1. **USB Controllers**: Plug directly into your computer
2. **Bluetooth Controllers**: Pair in your system settings first, then connect
3. **Wireless Controllers**: Ensure the wireless receiver is connected
4. **Browser Activation**: Press any button on your controller to activate it in the browser

#### Testing Your Controller
1. **Button Testing**: Press any button to see it light up in real-time
2. **Analog Testing**: Move sticks and triggers to see precise values
3. **Vibration Testing**: Click the "Test Vibration" button to test haptic feedback
4. **Multi-Controller**: Connect multiple controllers to test them simultaneously

## 🎮 Supported Controllers

### Xbox Controllers
- Xbox One Controller (USB/Wireless)
- Xbox Series X/S Controller (USB/Wireless)
- Xbox 360 Controller (USB/Wireless)
- Xbox Elite Controller

### PlayStation Controllers
- DualShock 4 (USB/Bluetooth)
- DualSense (USB/Bluetooth)
- PlayStation Classic Controller

### Nintendo Controllers
- Nintendo Switch Pro Controller (USB/Bluetooth)
- Joy-Con Controllers (USB/Bluetooth)
- Nintendo Switch GameCube Controller

### Other Controllers
- Generic USB Gamepads
- Bluetooth Gamepads
- Wireless Gaming Controllers
- Arcade Sticks
- Flight Sticks

## 🔧 Technical Details

### Browser Compatibility
- **Chrome**: Full support with vibration API
- **Firefox**: Full support with vibration API
- **Safari**: Basic support (limited vibration)
- **Edge**: Full support with vibration API

### APIs Used
- **Gamepad API**: Core controller detection and input
- **Vibration API**: Haptic feedback testing
- **Haptic Actuator API**: Advanced vibration patterns (where supported)

### Connection Types Detected
- **USB**: Direct wired connection
- **Bluetooth**: Wireless Bluetooth connection
- **Wireless**: RF wireless connection
- **Unknown**: Connection type not determined

## 📱 Mobile Support

The application works on mobile devices with controller support:
- **Android**: Full support with compatible controllers
- **iOS**: Limited support (requires specific controllers)
- **Tablets**: Works on tablets with controller support

## 🛠️ Development

### Project Structure
```
gamepad-tester/
├── index.html          # Main application file
├── styles.css          # Styling and responsive design
├── script.js           # Core application logic
├── README.md           # Documentation
└── LICENSE             # GNU GPL v3 License
```

### Key Features Implementation
- **Real-time Polling**: Uses `requestAnimationFrame` for smooth updates
- **Event-driven Architecture**: Responds to controller connect/disconnect events
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Keyboard navigation and screen reader support

### Browser Security
- **HTTPS Required**: Some APIs require secure context
- **User Interaction**: Controllers must be activated by user interaction
- **Permission Handling**: Graceful fallback for unsupported features

## 🐛 Troubleshooting

### Controller Not Detected
1. Ensure controller is properly connected
2. Press any button on the controller
3. Check browser console for error messages
4. Try refreshing the page
5. Verify browser supports Gamepad API

### Vibration Not Working
1. Check if controller supports vibration
2. Ensure browser supports Vibration API
3. Try different browsers (Chrome/Firefox recommended)
4. Check controller drivers are up to date

### Performance Issues
1. Close other applications using controllers
2. Disconnect unused controllers
3. Refresh the page
4. Check browser performance settings

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with different controllers
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information
4. Include your browser, OS, and controller details

---

**Happy Gaming! 🎮**