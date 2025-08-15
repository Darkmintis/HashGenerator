/**
 * HashGenerator Platform - Client Application
 * Generate secure hashes with no server dependencies
 */

// Configuration
const CONFIG = // Select algorithm
function selectAlgorithm(algorithmId) {
    if (!algorithmId) return;
    
    // Update state
    AppState.selectedAlgorithm = algorithmId;
    
    // Find algorithm info from config
    AppState.selectedAlgorithmInfo = findAlgorithmInfo(algorithmId);
    
    // Update UI
    updateAlgorithmUI(algorithmId);
    updateOptionsVisibility();
    
    // Reset last hash to ensure regeneration
    AppState.lastHash = null;
    
    // Generate hash with current input
    generateHash();
}

// Global application state
const AppState = {
    selectedAlgorithm: null,
    selectedAlgorithmInfo: null,
    hashHistory: [],
    darkMode: false,
    textInputTimer: null,
    lastText: '',
    lastOptions: {},
    lastHash: null
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupUI();
    setupEventListeners();
    loadSettings();
    loadHistory();
});

function initializeApp() {
    // Silent initialization
    updateStats();
    
    // Check if CryptoJS and hash generator are loaded
    if (typeof CryptoJS === 'undefined') {
        console.error('[CRITICAL] CryptoJS library not loaded - hash operations unavailable');
        showNotification('CryptoJS library failed to load', 'error');
        return;
    }
    
    if (!window.hashGenerator) {
        console.error('[CRITICAL] Hash generator module not initialized');
        showNotification('Hash generator failed to initialize', 'error');
        return;
    }
    
    // Set up hash generator statistics callback
    window.hashGenerator.onStatsUpdate = updateStats;
}

// Set up UI components
function setupUI() {
    // Populate algorithm tabs
    populateAlgorithms('basic', 'basicAlgorithms');
    populateAlgorithms('password', 'passwordAlgorithms');
    populateAlgorithms('modern', 'modernAlgorithms');
    populateAlgorithms('special', 'specialAlgorithms');
    
    // Initialize with first algorithm selected
    if (window.HASHGEN_CONFIG && window.HASHGEN_CONFIG.HASH_TYPES.BASIC.length > 0) {
        selectAlgorithm(window.HASHGEN_CONFIG.HASH_TYPES.BASIC[0].id);
    }
    
    // Setup tabs
    setupTabs();
    
    // Initialize option groups visibility
    updateOptionsVisibility();
}

// Populate algorithm cards
function populateAlgorithms(category, elementId) {
    const container = document.getElementById(elementId);
    if (!container || !window.HASHGEN_CONFIG) return;
    
    // Map category to config key
    const categoryMap = {
        'basic': 'BASIC',
        'password': 'PASSWORD_HASHING',
        'modern': 'MODERN',
        'special': 'SPECIAL'
    };
    
    const configKey = categoryMap[category];
    if (!configKey || !window.HASHGEN_CONFIG.HASH_TYPES[configKey]) return;
    
    const algorithms = window.HASHGEN_CONFIG.HASH_TYPES[configKey];
    
    // Clear container
    container.innerHTML = '';
    
    // Add algorithm cards
    algorithms.forEach(algo => {
        const card = document.createElement('div');
        card.className = 'algorithm-card';
        card.dataset.algorithm = algo.id;
        
        // Choose icon based on algorithm type
        let iconClass = 'fas fa-hashtag';
        if (algo.id.includes('md5')) iconClass = 'fas fa-fingerprint';
        else if (algo.id.includes('sha')) iconClass = 'fas fa-shield-alt';
        else if (algo.id.includes('bcrypt')) iconClass = 'fas fa-lock';
        else if (algo.id.includes('argon2')) iconClass = 'fas fa-key';
        else if (algo.id.includes('ntlm')) iconClass = 'fab fa-windows';
        
        card.innerHTML = `
            <div class="algorithm-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="algorithm-name">${algo.name}</div>
        `;
        
        // Add click event
        card.addEventListener('click', () => selectAlgorithm(algo.id));
        
        container.appendChild(card);
    });
}

// Setup tab functionality
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding tab content
            const tabId = button.dataset.tab + '-tab';
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Handle algorithm selection
function selectAlgorithm(algorithmId) {
    if (!algorithmId) return;
    
    // Update state
    AppState.selectedAlgorithm = algorithmId;
    
    // Find algorithm info from config
    AppState.selectedAlgorithmInfo = findAlgorithmInfo(algorithmId);
    
    // Update UI
    updateAlgorithmUI(algorithmId);
    updateOptionsVisibility();
    
    // Reset last hash to ensure regeneration
    AppState.lastHash = null;
    
    // Generate hash with current input
    generateHash();
}

// Find algorithm info in config
function findAlgorithmInfo(algorithmId) {
    if (!window.HASHGEN_CONFIG) return null;
    
    // Search in all algorithm categories
    for (const category of ['BASIC', 'PASSWORD_HASHING', 'MODERN', 'SPECIAL']) {
        const found = window.HASHGEN_CONFIG.HASH_TYPES[category].find(algo => algo.id === algorithmId);
        if (found) return found;
    }
    
    return null;
}

// Update algorithm selection UI
function updateAlgorithmUI(algorithmId) {
    // Remove selected class from all algorithm cards
    const allCards = document.querySelectorAll('.algorithm-card');
    allCards.forEach(card => card.classList.remove('selected'));
    
    // Add selected class to the selected algorithm
    const selectedCards = document.querySelectorAll(`.algorithm-card[data-algorithm="${algorithmId}"]`);
    selectedCards.forEach(card => card.classList.add('selected'));
}

// Update options visibility based on selected algorithm
function updateOptionsVisibility() {
    const algo = AppState.selectedAlgorithmInfo;
    if (!algo) return;
    
    // Salt options
    const saltGroup = document.getElementById('saltGroup');
    if (saltGroup) {
        saltGroup.style.display = algo.supports_salt ? 'block' : 'none';
    }
    
    // Iterations options (for PBKDF2)
    const iterationsGroup = document.getElementById('iterationsGroup');
    if (iterationsGroup) {
        iterationsGroup.style.display = (algo.id === 'pbkdf2') ? 'block' : 'none';
        
        // Set default iterations if available
        const iterationsInput = document.getElementById('iterationsInput');
        if (iterationsInput && algo.default_iterations) {
            iterationsInput.value = algo.default_iterations;
        }
    }
    
    // Cost factor options (for bcrypt)
    const costFactorGroup = document.getElementById('costFactorGroup');
    if (costFactorGroup) {
        costFactorGroup.style.display = (algo.id === 'bcrypt') ? 'block' : 'none';
        
        // Set default cost if available
        const costFactorRange = document.getElementById('costFactorRange');
        const costFactorValue = document.getElementById('costFactorValue');
        if (costFactorRange && costFactorValue && algo.default_cost) {
            costFactorRange.value = algo.default_cost;
            costFactorValue.textContent = algo.default_cost;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Text input change
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', handleTextInput);
    }
    
    // Salt generation
    const generateSaltBtn = document.getElementById('generateSalt');
    if (generateSaltBtn) {
        generateSaltBtn.addEventListener('click', generateRandomSalt);
    }
    
    // Cost factor slider
    const costFactorRange = document.getElementById('costFactorRange');
    const costFactorValue = document.getElementById('costFactorValue');
    if (costFactorRange && costFactorValue) {
        costFactorRange.addEventListener('input', () => {
            costFactorValue.textContent = costFactorRange.value;
            generateHash();
        });
    }
    
    // Option changes
    const optionInputs = document.querySelectorAll('.option-input, .option-select');
    optionInputs.forEach(input => {
        // Use 'input' event for immediate response, not just 'change'
        input.addEventListener('input', generateHash);
        input.addEventListener('change', generateHash);
    });
    
    // Toggle options
    const toggleOptionsBtn = document.getElementById('toggleOptions');
    const optionsContent = document.querySelector('.options-content');
    if (toggleOptionsBtn && optionsContent) {
        toggleOptionsBtn.addEventListener('click', () => {
            optionsContent.classList.toggle('hidden');
            toggleOptionsBtn.classList.toggle('active');
            toggleOptionsBtn.querySelector('i').classList.toggle('fa-chevron-up');
            toggleOptionsBtn.querySelector('i').classList.toggle('fa-chevron-down');
        });
    }
    
    // Toggle history
    const toggleHistoryBtn = document.getElementById('toggleHistory');
    const historyContent = document.querySelector('.history-content');
    if (toggleHistoryBtn && historyContent) {
        // Initially set the toggle icon to up since content is visible by default
        toggleHistoryBtn.querySelector('i').classList.remove('fa-chevron-down');
        toggleHistoryBtn.querySelector('i').classList.add('fa-chevron-up');
        toggleHistoryBtn.classList.add('active');
        
        toggleHistoryBtn.addEventListener('click', () => {
            historyContent.classList.toggle('hidden');
            toggleHistoryBtn.classList.toggle('active');
            toggleHistoryBtn.querySelector('i').classList.toggle('fa-chevron-up');
            toggleHistoryBtn.querySelector('i').classList.toggle('fa-chevron-down');
        });
    }
    
    // Copy button
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyHashToClipboard);
    }
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveHashToHistory);
    }
    
    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearInputs);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Handle text input with debounce
function handleTextInput() {
    const textInput = document.getElementById('textInput');
    if (!textInput) return;
    
    // Clear previous timer
    clearTimeout(AppState.textInputTimer);
    
    // Set new timer
    AppState.textInputTimer = setTimeout(() => {
        const text = textInput.value;
        
        // Update password strength if needed
        updatePasswordStrength(text);
        
        // Generate hash
        generateHash();
    }, 300); // 300ms debounce
}

// Generate hash based on current inputs
function generateHash() {
    const textInput = document.getElementById('textInput');
    const resultDisplay = document.getElementById('resultDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (!textInput || !resultDisplay || !window.hashGenerator || !AppState.selectedAlgorithm) {
        return;
    }
    
    const text = textInput.value.trim();
    
    // Disable buttons until we have a hash
    copyBtn.disabled = true;
    saveBtn.disabled = true;
    
    // Show loading state if text is not empty
    if (text) {
        resultDisplay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i> Generating hash...
            </div>
        `;
        
        // Get options
        const options = getHashOptions();
        
        // Skip duplicate calculations only if algorithm hasn't changed
        if (text === AppState.lastText && 
            JSON.stringify(options) === JSON.stringify(AppState.lastOptions) &&
            AppState.lastHash) {
            displayHash(AppState.lastHash);
            return;
        }
        
        // Store current values
        AppState.lastText = text;
        AppState.lastOptions = options;
        
        // Generate hash
        window.hashGenerator.generateHash(text, AppState.selectedAlgorithm, options)
            .then(hash => {
                AppState.lastHash = hash;
                displayHash(hash);
            })
            .catch(error => {
                resultDisplay.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i> ${error.message}
                    </div>
                `;
                showNotification('Error generating hash', 'error');
            });
    } else {
        // Clear result if text is empty
        resultDisplay.innerHTML = '<div class="result-placeholder">Enter text and select an algorithm to generate a hash</div>';
    }
}

// Display the generated hash
function displayHash(hash) {
    const resultDisplay = document.getElementById('resultDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (!resultDisplay || !hash) return;
    
    resultDisplay.innerHTML = `<div class="result-hash" title="Click to copy">${hash}</div>`;
    
    // Enable buttons
    copyBtn.disabled = false;
    saveBtn.disabled = false;
    
    // Add click-to-copy functionality
    const hashElement = resultDisplay.querySelector('.result-hash');
    if (hashElement) {
        hashElement.addEventListener('click', copyHashToClipboard);
    }
}

// Get hash options from UI
function getHashOptions() {
    const options = {};
    
    // Salt
    const saltInput = document.getElementById('saltInput');
    if (saltInput && saltInput.value.trim()) {
        options.salt = saltInput.value.trim();
    }
    
    // Iterations
    const iterationsInput = document.getElementById('iterationsInput');
    if (iterationsInput && iterationsInput.value) {
        options.iterations = parseInt(iterationsInput.value, 10);
    }
    
    // Cost factor
    const costFactorRange = document.getElementById('costFactorRange');
    if (costFactorRange) {
        options.costFactor = parseInt(costFactorRange.value, 10);
    }
    
    // Output format
    const outputFormat = document.getElementById('outputFormat');
    if (outputFormat) {
        options.outputFormat = outputFormat.value;
    }
    
    // Character case
    const characterCase = document.getElementById('characterCase');
    if (characterCase) {
        options.uppercase = (characterCase.value === 'uppercase');
    }
    
    return options;
}

// Generate random salt
function generateRandomSalt() {
    const saltInput = document.getElementById('saltInput');
    if (!saltInput || !window.hashGenerator) return;
    
    const salt = window.hashGenerator.generateSalt(16);
    saltInput.value = salt;
    
    // Regenerate hash with new salt
    generateHash();
}

// Copy hash to clipboard
function copyHashToClipboard() {
    const resultDisplay = document.getElementById('resultDisplay');
    if (!resultDisplay) return;
    
    const hashElement = resultDisplay.querySelector('.result-hash');
    if (!hashElement) return;
    
    const hash = hashElement.textContent;
    
    // Use Clipboard API if available
    if (navigator.clipboard) {
        navigator.clipboard.writeText(hash)
            .then(() => {
                showNotification('Hash copied to clipboard', 'success');
            })
            .catch(() => {
                fallbackCopy(hash);
            });
    } else {
        fallbackCopy(hash);
    }
}

// Fallback copy method
function fallbackCopy(text) {
    // Create temporary element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    
    try {
        const success = document.execCommand('copy');
        if (success) {
            showNotification('Hash copied to clipboard', 'success');
        } else {
            showNotification('Failed to copy hash', 'error');
        }
    } catch (err) {
        showNotification('Failed to copy hash', 'error');
    } finally {
        document.body.removeChild(textarea);
    }
}

// Save hash to history
function saveHashToHistory() {
    const textInput = document.getElementById('textInput');
    const resultDisplay = document.getElementById('resultDisplay');
    
    if (!textInput || !resultDisplay || !AppState.selectedAlgorithmInfo) return;
    
    const hashElement = resultDisplay.querySelector('.result-hash');
    if (!hashElement) return;
    
    const text = textInput.value.trim();
    const hash = hashElement.textContent;
    const algorithm = AppState.selectedAlgorithmInfo.name;
    
    // Create history item
    const historyItem = {
        text,
        algorithm,
        algorithmId: AppState.selectedAlgorithm,
        hash,
        options: getHashOptions(),
        timestamp: Date.now()
    };
    
    // Add to history
    AppState.hashHistory.unshift(historyItem);
    
    // Limit history size
    if (AppState.hashHistory.length > 50) {
        AppState.hashHistory = AppState.hashHistory.slice(0, 50);
    }
    
    // Save to storage
    saveHistory();
    
    // Show notification
    showNotification('Hash saved to history', 'success');
    
    // Update UI
    updateHistoryUI();
    
    // Show notification
    showNotification('Hash saved to history', 'success');
}

// Clear inputs
function clearInputs() {
    const textInput = document.getElementById('textInput');
    const saltInput = document.getElementById('saltInput');
    const resultDisplay = document.getElementById('resultDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (textInput) textInput.value = '';
    if (saltInput) saltInput.value = '';
    if (resultDisplay) {
        resultDisplay.innerHTML = '<div class="result-placeholder">Enter text and select an algorithm to generate a hash</div>';
    }
    
    // Disable buttons
    if (copyBtn) copyBtn.disabled = true;
    if (saveBtn) saveBtn.disabled = true;
    
    // Clear last values
    AppState.lastText = '';
    AppState.lastHash = null;
    
    // Reset password strength
    updatePasswordStrength('');
}

// Toggle dark/light theme
function toggleTheme() {
    const body = document.getElementById('app-body');
    const themeToggle = document.getElementById('themeToggle');
    
    if (!body || !themeToggle) return;
    
    // Toggle dark mode
    AppState.darkMode = !AppState.darkMode;
    
    // Update UI
    body.classList.toggle('dark-mode', AppState.darkMode);
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = AppState.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Save preference
    saveSettings();
}

// Update password strength meter
function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthText = document.getElementById('strengthText');
    const strengthMeter = document.getElementById('passwordStrength');
    
    if (!strengthIndicator || !strengthText || !strengthMeter || !window.hashGenerator) return;
    
    // Hide meter for empty password or non-password algorithms
    if (!password || (AppState.selectedAlgorithmInfo && !AppState.selectedAlgorithmInfo.id.includes('crypt') && !['pbkdf2', 'argon2', 'scrypt', 'bcrypt'].includes(AppState.selectedAlgorithmInfo.id))) {
        strengthMeter.classList.add('hidden');
        return;
    }
    
    // Show meter for password hashing algorithms
    strengthMeter.classList.remove('hidden');
    
    // Evaluate password strength
    const strength = window.hashGenerator.evaluatePasswordStrength(password);
    
    // Update indicator
    strengthIndicator.style.width = `${strength.score}%`;
    
    // Set color based on score
    if (strength.score < 20) {
        strengthIndicator.style.backgroundColor = '#ef4444';
    } else if (strength.score < 40) {
        strengthIndicator.style.backgroundColor = '#f59e0b';
    } else if (strength.score < 60) {
        strengthIndicator.style.backgroundColor = '#facc15';
    } else if (strength.score < 80) {
        strengthIndicator.style.backgroundColor = '#84cc16';
    } else {
        strengthIndicator.style.backgroundColor = '#10b981';
    }
    
    // Update text
    strengthText.textContent = `Password Strength: ${strength.rating} (${strength.feedback[0]})`;
}

// Update history UI
function updateHistoryUI() {
    const historyTable = document.getElementById('historyTableBody');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    
    if (!historyTable || !noHistoryMessage) return;
    
    // Show/hide no history message
    if (AppState.hashHistory.length === 0) {
        noHistoryMessage.style.display = 'block';
        historyTable.innerHTML = '';
        return;
    }
    
    // Hide message and show history
    noHistoryMessage.style.display = 'none';
    
    // Build table rows
    let tableContent = '';
    
    AppState.hashHistory.forEach((item, index) => {
        tableContent += `
            <tr>
                <td class="history-input">${escapeHtml(item.text)}</td>
                <td>${escapeHtml(item.algorithm)}</td>
                <td class="history-hash">${escapeHtml(item.hash)}</td>
                <td class="history-actions">
                    <button class="history-button" onclick="useHistoryItem(${index})" title="Use this hash">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="history-button" onclick="copyHistoryHash(${index})" title="Copy hash">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="history-button" onclick="removeHistoryItem(${index})" title="Remove from history">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    historyTable.innerHTML = tableContent;
}

// Use history item
function useHistoryItem(index) {
    const item = AppState.hashHistory[index];
    if (!item) return;
    
    // Set text input
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.value = item.text;
    }
    
    // Select algorithm
    selectAlgorithm(item.algorithmId);
    
    // Set options
    const saltInput = document.getElementById('saltInput');
    const iterationsInput = document.getElementById('iterationsInput');
    const costFactorRange = document.getElementById('costFactorRange');
    const costFactorValue = document.getElementById('costFactorValue');
    const outputFormat = document.getElementById('outputFormat');
    const characterCase = document.getElementById('characterCase');
    
    if (saltInput && item.options && item.options.salt) {
        saltInput.value = item.options.salt;
    }
    
    if (iterationsInput && item.options && item.options.iterations) {
        iterationsInput.value = item.options.iterations;
    }
    
    if (costFactorRange && costFactorValue && item.options && item.options.costFactor) {
        costFactorRange.value = item.options.costFactor;
        costFactorValue.textContent = item.options.costFactor;
    }
    
    if (outputFormat && item.options && item.options.outputFormat) {
        outputFormat.value = item.options.outputFormat;
    }
    
    if (characterCase && item.options && typeof item.options.uppercase !== 'undefined') {
        characterCase.value = item.options.uppercase ? 'uppercase' : 'lowercase';
    }
    
    // Generate hash
    generateHash();
    
    // Show notification
    showNotification('History item loaded', 'success');
}

// Copy hash from history
function copyHistoryHash(index) {
    const item = AppState.hashHistory[index];
    if (!item) return;
    
    // Use Clipboard API if available
    if (navigator.clipboard) {
        navigator.clipboard.writeText(item.hash)
            .then(() => {
                showNotification('Hash copied to clipboard', 'success');
            })
            .catch(() => {
                fallbackCopy(item.hash);
            });
    } else {
        fallbackCopy(item.hash);
    }
}

// Remove item from history
function removeHistoryItem(index) {
    AppState.hashHistory.splice(index, 1);
    
    // Save updated history
    saveHistory();
    
    // Update UI
    updateHistoryUI();
    
    // Show notification
    showNotification('History item removed', 'success');
}

// Save history to localStorage
function saveHistory() {
    try {
        localStorage.setItem(
            window.HASHGEN_CONFIG.STORAGE_KEYS.HISTORY,
            JSON.stringify(AppState.hashHistory)
        );
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

// Load history from localStorage
function loadHistory() {
    try {
        const storedHistory = localStorage.getItem(window.HASHGEN_CONFIG.STORAGE_KEYS.HISTORY);
        if (storedHistory) {
            AppState.hashHistory = JSON.parse(storedHistory);
            updateHistoryUI();
        }
    } catch (e) {
        console.error('Failed to load history:', e);
    }
}

// Save settings to localStorage
function saveSettings() {
    try {
        localStorage.setItem(
            window.HASHGEN_CONFIG.STORAGE_KEYS.SETTINGS,
            JSON.stringify({
                darkMode: AppState.darkMode
            })
        );
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

// Load settings from localStorage
function loadSettings() {
    try {
        const storedSettings = localStorage.getItem(window.HASHGEN_CONFIG.STORAGE_KEYS.SETTINGS);
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            
            // Apply dark mode if saved
            if (settings.darkMode) {
                AppState.darkMode = true;
                
                const body = document.getElementById('app-body');
                const themeToggle = document.getElementById('themeToggle');
                
                if (body) body.classList.add('dark-mode');
                
                if (themeToggle) {
                    const icon = themeToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-sun';
                }
            }
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

// Update statistics
function updateStats(stats) {
    const totalGenerated = document.getElementById('totalGenerated');
    const hashesPerSecond = document.getElementById('hashesPerSecond');
    const uniqueAlgorithms = document.getElementById('uniqueAlgorithms');
    
    if (!totalGenerated || !hashesPerSecond || !uniqueAlgorithms) return;
    
    // Use stats from callback or stored stats
    const currentStats = stats || {
        hashesPerSecond: window.hashGenerator ? window.hashGenerator.hashesPerSecond : 0,
        uniqueAlgorithms: window.hashGenerator ? window.hashGenerator.uniqueAlgorithmsUsed.size : 0
    };
    
    // Get total generated from localStorage if available
    let total = parseInt(localStorage.getItem('totalHashesGenerated') || '0', 10);
    
    // Increment if we have a new hash
    if (AppState.lastHash) {
        total++;
        localStorage.setItem('totalHashesGenerated', total.toString());
    }
    
    // Update UI
    totalGenerated.textContent = formatNumber(total);
    hashesPerSecond.textContent = formatNumber(currentStats.hashesPerSecond);
    uniqueAlgorithms.textContent = currentStats.uniqueAlgorithms;
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    else if (type === 'warning') icon = 'exclamation-circle';
    else if (type === 'error') icon = 'times-circle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (container.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Add to container
    container.appendChild(notification);
}

// Helper function to format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Expose functions for HTML onclick attributes
window.useHistoryItem = useHistoryItem;
window.copyHistoryHash = copyHistoryHash;
window.removeHistoryItem = removeHistoryItem;
