let timeLeft;
let timerId = null;
let isRunning = false;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const timerButtons = document.querySelectorAll('.timer-btn');

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
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
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = parseInt(document.querySelector('.timer-btn.active').dataset.time) * 60;
    updateDisplay();
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function setTimer(minutes) {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = minutes * 60;
    updateDisplay();
    startButton.disabled = false;
    pauseButton.disabled = true;
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

// Initialize timer
timeLeft = 25 * 60; // 25 minutes by default
updateDisplay(); 