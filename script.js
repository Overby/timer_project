let timeLeft;
let timerId = null;
let isRunning = false;
let isWorkMode = true;
let currentTask = '';
let notificationsEnabled = false;
let customTimeSet = false; // Track if a custom time was set

// Get all DOM elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const timerButtons = document.querySelectorAll('.timer-btn');
const customMinutesInput = document.getElementById('custom-minutes');
const setCustomTimeButton = document.getElementById('set-custom-time');
const modeToggleButton = document.getElementById('mode-toggle');
const taskModal = document.getElementById('task-modal');
const taskInput = document.getElementById('task-input');
const startWithTaskButton = document.getElementById('start-with-task');
const currentTaskDisplay = document.getElementById('current-task');
const taskTextDisplay = document.getElementById('task-text');
const modalCloseButton = document.querySelector('.modal-close');

// Add audio configuration
const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
alarmSound.volume = 0.7;
let alarmInterval = null;

// Request notification permission (only if not already denied)
if ('Notification' in window && Notification.permission === 'default') {
    // Don't request immediately - wait for user interaction
    // We'll request it when timer completes or when user starts timer
}

// Function to request notification permission if needed
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(function(permission) {
            notificationsEnabled = permission === 'granted';
        });
    } else if (Notification.permission === 'granted') {
        notificationsEnabled = true;
    }
}

// Function to send notification
function sendNotification() {
    // Request permission if not already granted/denied
    if ('Notification' in window && Notification.permission === 'default') {
        requestNotificationPermission();
    }
    
    if (notificationsEnabled || Notification.permission === 'granted') {
        const mode = isWorkMode ? 'Work' : 'Rest';
        const notification = new Notification('Pomodoro Timer', {
            body: `${mode} session completed! Time for a ${isWorkMode ? 'break' : 'new work session'}!`,
            icon: 'https://cdn-icons-png.flaticon.com/512/1830/1830839.png', // Tomato icon
            silent: true // We'll play our own sound
        });
    }
}

// Function to play alarm sound multiple times
function playAlarmSound() {
    alarmSound.play().catch(error => {
        console.log('Audio playback failed:', error);
        // Audio might be blocked by browser policy, that's okay
    });
    let playCount = 0;
    alarmInterval = setInterval(() => {
        if (playCount < 3) { // Play 4 times total (initial + 3)
            alarmSound.play().catch(error => {
                console.log('Audio playback failed:', error);
            });
            playCount++;
        } else {
            clearInterval(alarmInterval);
        }
    }, 1000);
}

// Function to stop alarm sound
function stopAlarmSound() {
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

function updateTitle(minutes, seconds) {
    if (isRunning) {
        // Format with leading zeros for both minutes and seconds
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        document.title = `${formattedMinutes}:${formattedSeconds} Pomodoro Timer`;
    } else {
        document.title = 'Pomodoro Timer';
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // Format minutes and seconds with leading zeros
    minutesDisplay.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsDisplay.textContent = seconds < 10 ? '0' + seconds : seconds;
    
    // Add title update with proper MM:SS format
    updateTitle(minutes, seconds);
}

function showTaskModal() {
    taskModal.classList.remove('hidden');
    taskInput.value = '';
    taskInput.focus();
    startButton.disabled = true;
}

function hideTaskModal() {
    taskModal.classList.add('hidden');
}

function updateTaskDisplay() {
    if (currentTask && isRunning) {
        taskTextDisplay.textContent = currentTask;
        currentTaskDisplay.classList.remove('hidden');
    } else {
        currentTaskDisplay.classList.add('hidden');
    }
}

function handleTaskSubmit() {
    currentTask = taskInput.value.trim();
    hideTaskModal();
    updateTaskDisplay();
    startTimer();
}

function startTimer() {
    if (!isRunning) {
        if (isWorkMode && !currentTask) {
            showTaskModal();
            return;
        }
        
        // Request notification permission on first user interaction
        if ('Notification' in window && Notification.permission === 'default') {
            requestNotificationPermission();
        }
        
        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        updateTaskDisplay();
        
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                startButton.disabled = false;
                pauseButton.disabled = true;
                currentTask = '';
                updateTaskDisplay();
                playAlarmSound();
                sendNotification();
                
                // Auto-switch mode after timer completes
                isWorkMode = !isWorkMode;
                modeToggleButton.textContent = isWorkMode ? 'Rest Mode' : 'Work Mode';
                
                // Set default time for new mode (reset custom time flag)
                customTimeSet = false;
                timeLeft = isWorkMode ? 25 * 60 : 5 * 60;
                updateDisplay();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
    stopAlarmSound();
    updateTaskDisplay();
    document.title = 'Pomodoro Timer';
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    stopAlarmSound();
    currentTask = '';
    
    // Reset to appropriate time based on mode and whether custom time was set
    if (customTimeSet) {
        // Keep the custom time if one was set
        // timeLeft remains the same
    } else {
        const activeButton = document.querySelector('.timer-btn.active');
        if (activeButton) {
            timeLeft = parseInt(activeButton.dataset.time) * 60;
        } else {
            // Fallback to default times
            timeLeft = isWorkMode ? 25 * 60 : 5 * 60;
        }
    }
    
    updateDisplay();
    updateTaskDisplay();
    startButton.disabled = false;
    pauseButton.disabled = true;
    document.title = 'Pomodoro Timer';
}

function setTimer(minutes) {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = minutes * 60;
    customTimeSet = false; // Reset custom time flag when using preset
    updateDisplay();
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function setCustomTimer() {
    const inputValue = customMinutesInput.value.trim();
    let totalSeconds;

    // Check if input contains a colon (MM:SS format)
    if (inputValue.includes(':')) {
        const parts = inputValue.split(':');
        if (parts.length !== 2) {
            alert('Please use MM:SS format (e.g., "25:30" for 25 minutes and 30 seconds)');
            return;
        }

        const minutes = parseInt(parts[0].trim());
        const seconds = parseInt(parts[1].trim());
        
        // Validate minutes and seconds
        if (isNaN(minutes) || isNaN(seconds) || 
            minutes < 0 || minutes > 180 || 
            seconds < 0 || seconds > 59) {
            alert('Please enter a valid time (minutes: 0-180, seconds: 0-59)');
            return;
        }
        
        totalSeconds = (minutes * 60) + seconds;
    } else {
        // Handle minutes-only input for backward compatibility
        const minutes = parseInt(inputValue);
        if (!minutes || minutes <= 0 || minutes > 180) {
            alert('Please enter either MM:SS format (e.g., "25:30") or minutes only (1-180)');
            return;
        }
        totalSeconds = minutes * 60;
    }

    if (totalSeconds > 0) {
        timerButtons.forEach(btn => btn.classList.remove('active'));
        timeLeft = totalSeconds;
        customTimeSet = true; // Mark that custom time is set
        updateDisplay();
        startButton.disabled = false;
        pauseButton.disabled = true;
        customMinutesInput.value = '';
    }
}

function toggleMode() {
    isWorkMode = !isWorkMode;
    modeToggleButton.textContent = isWorkMode ? 'Rest Mode' : 'Work Mode';
    
    // Only reset time if custom time wasn't set
    if (!customTimeSet) {
        timeLeft = isWorkMode ? 25 * 60 : 5 * 60;
    }
    
    // Clear task when switching modes
    currentTask = '';
    updateTaskDisplay();
    
    clearInterval(timerId);
    isRunning = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
    updateDisplay();
}

// Event Listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

timerButtons.forEach(button => {
    button.addEventListener('click', () => {
        timerButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        setTimer(parseInt(button.dataset.time));
    });
});

setCustomTimeButton.addEventListener('click', setCustomTimer);

customMinutesInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setCustomTimer();
    }
});

modeToggleButton.addEventListener('click', toggleMode);

startWithTaskButton.addEventListener('click', handleTaskSubmit);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleTaskSubmit();
    }
});

// Function to handle modal close
function handleModalClose(e) {
    e.preventDefault();
    hideTaskModal();
    // If timer hasn't started yet, enable the start button
    if (!isRunning) {
        startButton.disabled = false;
    }
}

// Add event listeners for modal interactions
modalCloseButton.addEventListener('click', handleModalClose);

// Close modal when clicking backdrop
taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        handleModalClose(e);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !taskModal.classList.contains('hidden')) {
        handleModalClose(e);
    }
});

// Initialize timer
timeLeft = 25 * 60; // 25 minutes by default
updateDisplay(); 