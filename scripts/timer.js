//getting the elements
const workHourInput = document.getElementById('workHours');
const workMinuteInput = document.getElementById('workMinutes');

const breakHourInput = document.getElementById('breakHours');
const breakMinuteInput = document.getElementById('breakMinutes');

const timerDisplay = document.getElementById('timerDisplay');
const timerHeader = document.getElementById('timerHeader');

var repeatAmountInput = document.getElementById('repeatAmount');

const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const pauseButton = document.getElementById('pauseButton');
const skipButton = document.getElementById('skipButton');

startButton.addEventListener("click", initializeTimer, false);
resetButton.addEventListener("click", resetTimer, false);
//pauseButton.addEventListener("click", pauseTimer, false);
skipButton.addEventListener("click", skipTimer, false);

//declaring basic variables
var count = 0;
var waitCount = 1;

var nextTimer;
var timerIsActive = false;
var timerSkipped = false;

function initializeTimer() {
    //resetting the display every time the timer resets
    timerIsActive = true;
    timerSkipped = false;
    waitCount = 1;
    timerHeader.textContent = 'Timer Stopped';
    timerDisplay.textContent = ('--:--:--');

    //take in the values from the input elements and store them as variables
    var workHourValue = parseFloat(workHourInput.value);
    var workMinuteValue = parseFloat(workMinuteInput.value);
    var breakHourValue = parseFloat(breakHourInput.value);
    var breakMinuteValue = parseFloat(breakMinuteInput.value);
    var repeatAmountValue = repeatAmountInput.value;


    //check if the user inputted at least 1 value
    if (isNaN(workHourValue) && isNaN(workMinuteValue) && isNaN(breakHourValue) && isNaN(breakMinuteValue)) {
        alert('Enter at least 1 value!');
        resetTimer();
    }
    //default to 0
    else {
        if (isNaN(workHourValue)) {
            workHourValue = 0;
        }
        if (isNaN(workMinuteValue)) {
            workMinuteValue = 0;
        }
        if (isNaN(breakHourValue)) {
            breakHourValue = 0;
        }
        if (isNaN(breakMinuteValue)) {
            breakMinuteValue = 0;
        }
    }

    //check if timer has run more times than we want to repeat
    if ((count - 1) > repeatAmountValue) {
        resetTimer();
    }
    else if (count % 2 == 0) {
        updateWorkTimer(workHourValue, workMinuteValue);
    }
    else {
        updateBreakTimer(breakHourValue, breakMinuteValue);
    }
}

function skipTimer() {
    if (timerIsActive) {
        timerHeader.textContent = 'Timer Skipped';
        timerDisplay.textContent = ('--:--:--');
        timerSkipped = true;
        count++;
        clearTimeout();
    }
}

//reset every time timer stops
function resetTimer() {
    clearTimeout();
    timerIsActive = false;
    count = 0;
    waitCount = 1;
    timerHeader.textContent = 'Timer Stopped';
    timerDisplay.textContent = ('--:--:--');
    nextTimer = 'Work';
}

function updateWorkTimer(hourValue, minuteValue) {
    timerHeader.textContent = `Work Time Remaining:`;
    nextTimer = 'Break';
    var timeStart = new Date().getTime();
    var timeEnd = (timeStart + (hourValue * 3600000) + (minuteValue * 60000));

    loop(hourValue, minuteValue, timeStart, timeEnd, nextTimer);
}

function updateBreakTimer(hourValue, minuteValue) {
    timerHeader.textContent = `Break Time Remaining:`;
    nextTimer = 'Work';
    var timeStart = new Date().getTime();
    var timeEnd = (timeStart + (hourValue * 3600000) + (minuteValue * 60000));

    loop(hourValue, minuteValue, timeStart, timeEnd, nextTimer);
}

function loop(hourValue, minuteValue, timeStart, timeEnd, nextTimer) {
    if (timerIsActive) {
        if (timerSkipped) {
            getTimeRemaining(hourValue, minuteValue, timeStart, timeEnd) == '00:00';
            timerDisplay.textContent = ('--:--:--');
            initializeTimer();
        }
        else if (getTimeRemaining(hourValue, minuteValue, timeStart, timeEnd) != '00:00') {
            setTimeout(() => {
                timerDisplay.textContent = getTimeRemaining(hourValue, minuteValue, timeStart, timeEnd);
                loop(hourValue, minuteValue, timeStart, timeEnd, nextTimer);
            }, 1000);
        }
        else {
            count++;
            timerSwitch(nextTimer);
        }
    }
    else {
        resetTimer();
    }
}

function timerSwitch(nextTimer) {
    timerSkipped = false;
    if ((count - 1) > repeatAmountInput.value) {
        resetTimer();
    }
    else if (waitCount <= 4) {
        setTimeout(() => {
            timerHeader.textContent = ('Starting ' + nextTimer + ' Timer');
            timerDisplay.textContent = (waitCount + '...');
            waitCount++;
            timerSwitch(nextTimer);
        }, 1000);
    }
    else {
        initializeTimer();
    }
}

function getTimeRemaining(hourValue, minuteValue, timeStart, timeEnd) {
    var timeRemainingOutput;
    var timeNow = new Date().getTime();
    var duration = (timeEnd - timeNow) + 2000;

    var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((duration % (1000 * 60)) / 1000);

    if (hourValue == 0 || hours == 0) {
        timeRemainingOutput = `${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    else {
        timeRemainingOutput = `${('00' + hours).slice(-2)}:${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    return timeRemainingOutput;
}
