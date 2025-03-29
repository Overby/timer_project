let timeLeft;
let timerId = null;
let isRunning = false;
let isWorkMode = true;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const timerButtons = document.querySelectorAll('.timer-btn');
const customMinutesInput = document.getElementById('custom-minutes');
const setCustomTimeButton = document.getElementById('set-custom-time');
const modeToggleButton = document.getElementById('mode-toggle');

// Add audio configuration
const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
alarmSound.volume = 0.7; // Set default volume to 70%
let alarmInterval = null;

// Function to play alarm sound multiple times
function playAlarmSound() {
    alarmSound.play();
    let playCount = 0;
    alarmInterval = setInterval(() => {
        if (playCount < 3) { // Play 4 times total (initial + 3)
            alarmSound.play();
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
        document.title = `(${minutes}:${seconds < 10 ? '0' : ''}${seconds}) Pomodoro Timer`;
    } else {
        document.title = 'Pomodoro Timer'; // Reset title when timer is not running
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    minutesDisplay.textContent = minutes;
    secondsDisplay.textContent = seconds < 10 ? '0' + seconds : seconds;
    
    // Add title update
    updateTitle(minutes, seconds);
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                startButton.disabled = false;
                pauseButton.disabled = true;
                playAlarmSound();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
    stopAlarmSound(); // Stop alarm if it's playing
    document.title = 'Pomodoro Timer'; // Reset title when paused
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    stopAlarmSound(); // Stop alarm if it's playing
    timeLeft = isWorkMode ? 
        parseInt(document.querySelector('.timer-btn.active').dataset.time) * 60 :
        5 * 60; // 5 minutes for rest mode
    updateDisplay();
    startButton.disabled = false;
    pauseButton.disabled = true;
    document.title = 'Pomodoro Timer'; // Reset title when reset
}

function setTimer(minutes) {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = minutes * 60;
    updateDisplay();
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function setCustomTimer() {
    const inputValue = customMinutesInput.value.trim();
    let totalSeconds;

    // Check if input contains a colon (MM:SS format)
    if (inputValue.includes(':')) {
        const [minutes, seconds] = inputValue.split(':').map(num => parseInt(num));
        
        // Validate minutes and seconds
        if (isNaN(minutes) || isNaN(seconds) || 
            minutes < 0 || minutes > 180 || 
            seconds < 0 || seconds > 59) {
            alert('Please enter a valid time in MM:SS format (max 180:00)');
            return;
        }
        
        totalSeconds = (minutes * 60) + seconds;
    } else {
        // Handle minutes-only input
        const minutes = parseInt(inputValue);
        if (!minutes || minutes <= 0 || minutes > 180) {
            alert('Please enter a valid time (1-180 minutes or MM:SS format)');
            return;
        }
        totalSeconds = minutes * 60;
    }

    if (totalSeconds > 0) {
        timerButtons.forEach(btn => btn.classList.remove('active'));
        timeLeft = totalSeconds;
        updateDisplay();
        startButton.disabled = false;
        pauseButton.disabled = true;
        customMinutesInput.value = '';
    }
}

function toggleMode() {
    isWorkMode = !isWorkMode;
    modeToggleButton.textContent = isWorkMode ? 'Rest Mode' : 'Work Mode';
    
    timeLeft = isWorkMode ? 25 * 60 : 5 * 60;
    
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

// Initialize timer
timeLeft = 25 * 60; // 25 minutes by default
updateDisplay(); 