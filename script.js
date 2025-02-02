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
                new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startButton.disabled = false;
    pauseButton.disabled = true;
    document.title = 'Pomodoro Timer'; // Reset title when paused
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
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
    const customMinutes = parseInt(customMinutesInput.value);
    if (customMinutes && customMinutes > 0 && customMinutes <= 180) {
        timerButtons.forEach(btn => btn.classList.remove('active'));
        
        setTimer(customMinutes);
        
        customMinutesInput.value = '';
    } else {
        alert('Please enter a valid time between 1 and 180 minutes');
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