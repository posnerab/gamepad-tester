class GamepadTester {
    constructor() {
        this.controllers = new Map();
        this.animationFrame = null;
        this.pollingStats = {
            frameCount: 0,
            lastFrameTime: 0,
            frameRate: 0,
            pollingRate: 0,
            lastPollTime: 0,
            inputChangeCount: 0,
            inputPollingRate: 0
        };
        this.inputChangeCounters = {}; // { [controllerIndex]: { count, lastButtons, lastAxes, minInterval, lastChangeTime, maxRate } }
        this.init();
    }

    init() {
        this.setupSystemInfo();
        this.setupEventListeners();
        this.startPolling();
    }

    setupSystemInfo() {
        // Display system information
        document.getElementById('userAgent').textContent = navigator.userAgent;
        document.getElementById('gamepadSupport').textContent = 
            navigator.getGamepads ? 'Supported' : 'Not Supported';
        document.getElementById('vibrationSupport').textContent = 
            navigator.vibrate ? 'Supported' : 'Not Supported';
        document.getElementById('hapticSupport').textContent = 
            'Check with controller';
        document.getElementById('hidSupport').textContent = 
            navigator.hid ? 'Supported' : 'Not Supported';
        
        // Start polling rate monitoring
        this.updatePollingStats();
        this.updateInputPollingStats();
    }

    setupEventListeners() {
        // Listen for gamepad connection events
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad);
            this.addController(e.gamepad);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Gamepad disconnected:', e.gamepad);
            this.removeController(e.gamepad.index);
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopPolling();
            } else {
                this.startPolling();
            }
        });
    }

    addController(gamepad) {
        const controllerId = `controller-${gamepad.index}`;
        const controllerElement = this.createControllerElement(gamepad);
        
        this.controllers.set(gamepad.index, {
            gamepad: gamepad,
            element: controllerElement,
            lastButtons: new Array(gamepad.buttons.length).fill(false),
            lastAxes: new Array(gamepad.axes.length).fill(0)
        });

        document.getElementById('controllersGrid').appendChild(controllerElement);
        this.updateStatus();
        this.updateHapticSupport(gamepad);
        this.logControllerDetails(gamepad);
        this.inputChangeCounters[gamepad.index] = {
            count: 0,
            lastButtons: gamepad.buttons.map(b => b.value),
            lastAxes: [...gamepad.axes],
            minInterval: Infinity,
            lastChangeTime: null,
            maxRate: 0
        };
    }

    removeController(index) {
        const controller = this.controllers.get(index);
        if (controller) {
            controller.element.remove();
            this.controllers.delete(index);
            this.updateStatus();
        }
        delete this.inputChangeCounters[index];
    }

    createControllerElement(gamepad) {
        const controllerDiv = document.createElement('div');
        controllerDiv.className = 'controller-card';
        controllerDiv.id = `controller-${gamepad.index}`;

        const controllerInfo = this.getControllerInfo(gamepad);
        
        controllerDiv.innerHTML = `
            <div class="controller-header">
                <div class="controller-name">${controllerInfo.name}</div>
                <div class="controller-id">ID: ${gamepad.index}</div>
            </div>
            
            <div class="controller-info">
                <div class="info-row">
                    <span class="info-label">Raw ID:</span>
                    <span class="info-value">${gamepad.id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">System Recognition:</span>
                    <span class="info-value">${controllerInfo.systemRecognition}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Connection:</span>
                    <span class="info-value">${controllerInfo.connection}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mapping:</span>
                    <span class="info-value">${controllerInfo.mapping}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Buttons:</span>
                    <span class="info-value">${gamepad.buttons.length}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Axes:</span>
                    <span class="info-value">${gamepad.axes.length}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Timestamp:</span>
                    <span class="info-value">${gamepad.timestamp}</span>
                </div>
            </div>
            
            <div class="buttons-section">
                <div class="section-title">Buttons</div>
                <div class="buttons-grid" id="buttons-${gamepad.index}">
                    ${this.createButtonsHTML(gamepad.buttons.length)}
                </div>
            </div>
            
            <div class="axes-section">
                <div class="section-title">Axes</div>
                <div class="axes-grid" id="axes-${gamepad.index}">
                    ${this.createAxesHTML(gamepad.axes.length)}
                </div>
            </div>
            
            <div class="vibration-section">
                <button class="vibration-button" onclick="gamepadTester.testVibration(${gamepad.index})" 
                        id="vibration-${gamepad.index}">
                    Test Vibration
                </button>
                <div class="vibration-debug" style="margin-top: 10px; font-size: 0.8rem; color: #666;">
                    <div>Haptic Actuators: ${gamepad.hapticActuators ? gamepad.hapticActuators.length : 0}</div>
                    <div>Vibration Actuator: ${gamepad.vibrationActuator ? 'Yes' : 'No'}</div>
                </div>
            </div>
        `;

        return controllerDiv;
    }

    getControllerInfo(gamepad) {
        const name = gamepad.id || 'Unknown Controller';
        let connection = 'Unknown';
        let mapping = gamepad.mapping || 'Standard';
        let systemRecognition = 'Unknown';

        // Detect connection type based on controller name
        const nameLower = name.toLowerCase();
        if (nameLower.includes('bluetooth') || nameLower.includes('bt')) {
            connection = 'Bluetooth';
        } else if (nameLower.includes('wireless') || nameLower.includes('rf')) {
            connection = 'Wireless';
        } else if (nameLower.includes('usb') || nameLower.includes('wired')) {
            connection = 'USB';
        } else {
            // Try to detect based on common controller names
            if (nameLower.includes('xbox') || nameLower.includes('xinput')) {
                connection = 'USB/Wireless';
            } else if (nameLower.includes('playstation') || nameLower.includes('dualshock') || nameLower.includes('dualsense')) {
                connection = 'USB/Bluetooth';
            } else if (nameLower.includes('nintendo') || nameLower.includes('joy-con') || nameLower.includes('pro controller')) {
                connection = 'USB/Bluetooth';
            }
        }

        // Detect system recognition based on controller name
        if (nameLower.includes('dualshock') || nameLower.includes('playstation')) {
            systemRecognition = 'PlayStation DualShock';
        } else if (nameLower.includes('dualsense')) {
            systemRecognition = 'PlayStation DualSense';
        } else if (nameLower.includes('xbox') || nameLower.includes('xinput')) {
            systemRecognition = 'Xbox Controller';
        } else if (nameLower.includes('nintendo') || nameLower.includes('joy-con') || nameLower.includes('pro controller')) {
            systemRecognition = 'Nintendo Controller';
        } else if (nameLower.includes('gamesir')) {
            systemRecognition = 'GameSir Controller';
        } else {
            systemRecognition = 'Generic Controller';
        }

        return { name, connection, mapping, systemRecognition };
    }

    createButtonsHTML(buttonCount) {
        const buttonNames = [
            'A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start',
            'L3', 'R3', 'Home', 'Capture', 'Guide', 'Touchpad', 'Misc'
        ];

        let html = '';
        for (let i = 0; i < buttonCount; i++) {
            const buttonName = buttonNames[i] || `Button ${i}`;
            html += `<div class="button" id="button-${i}" data-button="${i}">${buttonName}</div>`;
        }
        return html;
    }

    createAxesHTML(axesCount) {
        const axisNames = ['Left X', 'Left Y', 'Right X', 'Right Y', 'L2', 'R2'];
        
        let html = '';
        for (let i = 0; i < axesCount; i++) {
            const axisName = axisNames[i] || `Axis ${i}`;
            html += `
                <div class="axis-item">
                    <div class="axis-name">${axisName}</div>
                    <div class="axis-value" id="axis-value-${i}">0.00</div>
                    <div class="axis-visual">
                        <div class="axis-fill" id="axis-fill-${i}" style="width: 50%"></div>
                    </div>
                </div>
            `;
        }
        return html;
    }

    updateController(gamepad) {
        const controller = this.controllers.get(gamepad.index);
        if (!controller) return;

        // Update polling rate
        this.updateControllerPollingRate(gamepad);

        // Update buttons
        gamepad.buttons.forEach((button, index) => {
            const buttonElement = controller.element.querySelector(`#button-${index}`);
            if (buttonElement) {
                const isPressed = button.pressed || button.value > 0.5;
                const wasPressed = controller.lastButtons[index];
                
                if (isPressed !== wasPressed) {
                    buttonElement.classList.toggle('pressed', isPressed);
                    buttonElement.classList.toggle('active', isPressed);
                    
                    if (isPressed) {
                        console.log(`Button ${index} pressed on controller ${gamepad.index}`);
                    }
                }
                
                controller.lastButtons[index] = isPressed;
            }
        });

        // Update axes
        gamepad.axes.forEach((axis, index) => {
            const valueElement = controller.element.querySelector(`#axis-value-${index}`);
            const fillElement = controller.element.querySelector(`#axis-fill-${index}`);
            
            if (valueElement && fillElement) {
                const value = Math.round(axis * 100) / 100;
                const percentage = ((axis + 1) / 2) * 100; // Convert from [-1,1] to [0,100]
                
                valueElement.textContent = value.toFixed(2);
                fillElement.style.width = `${percentage}%`;
                
                // Update fill color based on value
                if (Math.abs(axis) > 0.1) {
                    fillElement.style.background = axis > 0 ? '#28a745' : '#dc3545';
                } else {
                    fillElement.style.background = 'linear-gradient(90deg, #dc3545, #ffc107, #28a745)';
                }
            }
        });

        // Update timestamp
        const timestampElement = controller.element.querySelector('.info-value:last-child');
        if (timestampElement) {
            timestampElement.textContent = gamepad.timestamp;
        }

        // --- Input polling rate tracking ---
        const inputCounter = this.inputChangeCounters[gamepad.index];
        if (inputCounter) {
            let changed = false;
            // Check buttons
            gamepad.buttons.forEach((button, i) => {
                if (button.value !== inputCounter.lastButtons[i]) {
                    changed = true;
                    inputCounter.lastButtons[i] = button.value;
                }
            });
            // Check axes
            gamepad.axes.forEach((axis, i) => {
                if (axis !== inputCounter.lastAxes[i]) {
                    changed = true;
                    inputCounter.lastAxes[i] = axis;
                }
            });
            if (changed) {
                inputCounter.count++;
                const now = performance.now();
                if (inputCounter.lastChangeTime !== null) {
                    const interval = now - inputCounter.lastChangeTime;
                    if (interval > 0 && interval < inputCounter.minInterval) {
                        inputCounter.minInterval = interval;
                        inputCounter.maxRate = Math.round(1000 / interval);
                    }
                }
                inputCounter.lastChangeTime = now;
            }
        }
    }

    async testVibration(controllerIndex) {
        const controller = this.controllers.get(controllerIndex);
        if (!controller) return;

        const vibrationButton = document.getElementById(`vibration-${controllerIndex}`);
        vibrationButton.disabled = true;
        vibrationButton.textContent = 'Testing...';

        // Log controller information for debugging
        console.log('Controller info:', {
            id: controller.gamepad.id,
            index: controller.gamepad.index,
            hapticActuators: controller.gamepad.hapticActuators,
            vibrationActuator: controller.gamepad.vibrationActuator,
            buttons: controller.gamepad.buttons.length,
            axes: controller.gamepad.axes.length
        });

        try {
            let vibrationWorked = false;
            
            // Method 1: Try Gamepad Haptic Actuator API (most reliable for controllers)
            if (controller.gamepad.hapticActuators && controller.gamepad.hapticActuators.length > 0) {
                console.log('Trying Gamepad Haptic Actuator API...');
                const actuator = controller.gamepad.hapticActuators[0];
                
                if (actuator.playEffect) {
                    try {
                        await actuator.playEffect('dual-rumble', {
                            duration: 500,
                            strongMagnitude: 1.0,
                            weakMagnitude: 0.5
                        });
                        vibrationWorked = true;
                        console.log('Haptic Actuator API vibration successful');
                    } catch (error) {
                        console.log('Haptic Actuator API failed:', error);
                    }
                }
            }
            
            // Method 2: Try Gamepad Vibration API (newer browsers)
            if (!vibrationWorked && controller.gamepad.vibrationActuator) {
                console.log('Trying Gamepad Vibration API...');
                try {
                    await controller.gamepad.vibrationActuator.playEffect('dual-rumble', {
                        duration: 500,
                        strongMagnitude: 1.0,
                        weakMagnitude: 0.5
                    });
                    vibrationWorked = true;
                    console.log('Vibration API vibration successful');
                } catch (error) {
                    console.log('Vibration API failed:', error);
                }
            }
            
            // Method 3: Try navigator.vibrate (mobile devices)
            if (!vibrationWorked && navigator.vibrate) {
                console.log('Trying navigator.vibrate...');
                try {
                    // Test with different patterns
                    const patterns = [200, 100, 200, 100, 200];
                    navigator.vibrate(patterns);
                    vibrationWorked = true;
                    console.log('navigator.vibrate successful');
                } catch (error) {
                    console.log('navigator.vibrate failed:', error);
                }
            }
            
            // Method 4: Try Web HID API (if available)
            if (!vibrationWorked && navigator.hid) {
                console.log('Trying Web HID API...');
                try {
                    // This is a more advanced method for HID devices
                    const devices = await navigator.hid.getDevices();
                    for (const device of devices) {
                        if (device.productName && device.productName.toLowerCase().includes('controller')) {
                            console.log('Found HID controller:', device.productName);
                            // Note: Actual vibration implementation would require device-specific commands
                        }
                    }
                } catch (error) {
                    console.log('Web HID API failed:', error);
                }
            }

            if (vibrationWorked) {
                vibrationButton.textContent = 'Vibration Tested ✓';
                console.log('Vibration test completed successfully');
            } else {
                vibrationButton.textContent = 'No Vibration Support ✗';
                console.log('No vibration method worked');
            }
            
            setTimeout(() => {
                vibrationButton.textContent = 'Test Vibration';
                vibrationButton.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Vibration test failed:', error);
            vibrationButton.textContent = 'Vibration Failed ✗';
            setTimeout(() => {
                vibrationButton.textContent = 'Test Vibration';
                vibrationButton.disabled = false;
            }, 2000);
        }
    }

    logControllerDetails(gamepad) {
        const controllerInfo = this.getControllerInfo(gamepad);
        console.log('=== Controller Details ===');
        console.log('Index:', gamepad.index);
        console.log('Raw ID:', gamepad.id);
        console.log('System Recognition:', controllerInfo.systemRecognition);
        console.log('Connection Type:', controllerInfo.connection);
        console.log('Mapping:', controllerInfo.mapping);
        console.log('Buttons:', gamepad.buttons.length);
        console.log('Axes:', gamepad.axes.length);
        console.log('Haptic Actuators:', gamepad.hapticActuators ? gamepad.hapticActuators.length : 0);
        console.log('Vibration Actuator:', gamepad.vibrationActuator ? 'Yes' : 'No');
        console.log('Timestamp:', gamepad.timestamp);
        console.log('========================');
    }

    updateHapticSupport(gamepad) {
        let hapticStatus = 'Not Supported';
        
        if (gamepad.hapticActuators && gamepad.hapticActuators.length > 0) {
            hapticStatus = 'Supported';
        } else if (gamepad.vibrationActuator) {
            hapticStatus = 'Supported (Vibration API)';
        } else {
            hapticStatus = 'Not Supported';
        }
        
        document.getElementById('hapticSupport').textContent = hapticStatus;
        console.log(`Controller ${gamepad.index} haptic support: ${hapticStatus}`);
    }

    updatePollingStats() {
        const now = performance.now();
        
        // Update frame rate
        if (this.pollingStats.lastFrameTime > 0) {
            const frameDelta = now - this.pollingStats.lastFrameTime;
            this.pollingStats.frameRate = Math.round(1000 / frameDelta);
        }
        this.pollingStats.lastFrameTime = now;
        this.pollingStats.frameCount++;
        
        // Update polling rate (how often we get new gamepad data)
        if (this.controllers.size > 0) {
            const gamepads = navigator.getGamepads();
            let hasNewData = false;
            
            for (const gamepad of gamepads) {
                if (gamepad && gamepad.timestamp !== this.pollingStats.lastPollTime) {
                    hasNewData = true;
                    break;
                }
            }
            
            if (hasNewData) {
                this.pollingStats.pollingRate = this.pollingStats.frameRate;
                this.pollingStats.lastPollTime = now;
            }
        }
        
        // Update display
        document.getElementById('frameRate').textContent = `${this.pollingStats.frameRate} FPS`;
        document.getElementById('pollingRate').textContent = `${this.pollingStats.pollingRate} Hz`;
        
        // Continue monitoring
        setTimeout(() => this.updatePollingStats(), 1000);
    }

    updateInputPollingStats() {
        // Sum all input changes across controllers
        let totalInputChanges = 0;
        let maxObservedRate = 0;
        for (const idx in this.inputChangeCounters) {
            totalInputChanges += this.inputChangeCounters[idx].count;
            if (this.inputChangeCounters[idx].maxRate > maxObservedRate) {
                maxObservedRate = this.inputChangeCounters[idx].maxRate;
            }
            this.inputChangeCounters[idx].count = 0; // reset for next interval
        }
        this.pollingStats.inputPollingRate = totalInputChanges;
        this.pollingStats.maxInputPollingRate = maxObservedRate;
        document.getElementById('inputPollingRate').textContent = `${this.pollingStats.inputPollingRate} Hz`;
        document.getElementById('maxInputPollingRate').textContent = `${this.pollingStats.maxInputPollingRate || 0} Hz`;
        // Show warning if max rate < 800Hz
        const warning = document.getElementById('pollingWarning');
        if (warning) {
            if (this.pollingStats.maxInputPollingRate && this.pollingStats.maxInputPollingRate < 700) {
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        }
        setTimeout(() => this.updateInputPollingStats(), 1000);
    }

    updateControllerPollingRate(gamepad) {
        const now = performance.now();
        
        // Check if this is new data
        if (gamepad.timestamp !== this.pollingStats.lastPollTime) {
            this.pollingStats.pollingRate = this.pollingStats.frameRate;
            this.pollingStats.lastPollTime = now;
        }
    }

    updateDebugInfo() {
        const debugContent = document.getElementById('debugContent');
        let debugHTML = '';
        
        for (const [index, controller] of this.controllers) {
            const gamepad = controller.gamepad;
            const controllerInfo = this.getControllerInfo(gamepad);
            const inputRate = this.inputChangeCounters[index]?.count || 0;
            const maxRate = this.inputChangeCounters[index]?.maxRate || 0;
            debugHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <h5 style="margin-bottom: 10px; color: #2c3e50;">Controller ${index}</h5>
                    <div style="font-family: monospace; font-size: 0.9rem; line-height: 1.4;">
                        <div><strong>Raw ID:</strong> ${gamepad.id}</div>
                        <div><strong>System Recognition:</strong> ${controllerInfo.systemRecognition}</div>
                        <div><strong>Connection Type:</strong> ${controllerInfo.connection}</div>
                        <div><strong>Mapping:</strong> ${controllerInfo.mapping}</div>
                        <div><strong>Buttons:</strong> ${gamepad.buttons.length}</div>
                        <div><strong>Axes:</strong> ${gamepad.axes.length}</div>
                        <div><strong>Haptic Actuators:</strong> ${gamepad.hapticActuators ? gamepad.hapticActuators.length : 0}</div>
                        <div><strong>Vibration Actuator:</strong> ${gamepad.vibrationActuator ? 'Yes' : 'No'}</div>
                        <div><strong>Timestamp:</strong> ${gamepad.timestamp}</div>
                        <div><strong>Polling Rate:</strong> ${this.pollingStats.pollingRate} Hz</div>
                        <div><strong>Frame Rate:</strong> ${this.pollingStats.frameRate} FPS</div>
                        <div><strong>Input Polling Rate:</strong> ${this.pollingStats.inputPollingRate} Hz</div>
                        <div><strong>Max Input Polling Rate:</strong> ${maxRate} Hz</div>
                    </div>
                </div>
            `;
        }
        
        debugContent.innerHTML = debugHTML;
    }

    updateStatus() {
        const connectedCount = this.controllers.size;
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const connectedCountElement = document.getElementById('connectedCount');
        const controllersGrid = document.getElementById('controllersGrid');
        const noControllers = document.getElementById('noControllers');
        const controllerDebug = document.getElementById('controllerDebug');

        connectedCountElement.textContent = connectedCount;

        if (connectedCount > 0) {
            statusIndicator.classList.add('connected');
            statusText.textContent = `${connectedCount} controller${connectedCount > 1 ? 's' : ''} connected`;
            controllersGrid.style.display = 'grid';
            noControllers.style.display = 'none';
            controllerDebug.style.display = 'block';
            this.updateDebugInfo();
        } else {
            statusIndicator.classList.remove('connected');
            statusText.textContent = 'No controllers detected';
            controllersGrid.style.display = 'none';
            noControllers.style.display = 'block';
            controllerDebug.style.display = 'none';
        }
    }

    startPolling() {
        if (this.animationFrame) return;
        
        const pollGamepads = () => {
            const gamepads = navigator.getGamepads();
            
            // Update existing controllers
            for (const [index, controller] of this.controllers) {
                const gamepad = gamepads[index];
                if (gamepad) {
                    this.updateController(gamepad);
                }
            }
            
            // Check for new controllers
            for (const gamepad of gamepads) {
                if (gamepad && !this.controllers.has(gamepad.index)) {
                    this.addController(gamepad);
                }
            }
            
            this.animationFrame = requestAnimationFrame(pollGamepads);
        };
        
        pollGamepads();
    }

    stopPolling() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
}

// Initialize the gamepad tester when the page loads
let gamepadTester;
document.addEventListener('DOMContentLoaded', () => {
    gamepadTester = new GamepadTester();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (gamepadTester) {
        gamepadTester.stopPolling();
    }
}); 