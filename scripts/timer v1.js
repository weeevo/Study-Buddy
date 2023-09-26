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
pauseButton.addEventListener("click", pauseTimer, false);
skipButton.addEventListener("click", skipTimer, false);

//declaring counters
var runCount = 0;
var waitCount;
var pauseCount = 1;

//declaring timer functionality variables
var time;
var nextTimer;
var timerIsActive = false;
var timerSkipped = false;
var timerPaused = false;

function initializeTimer() {
    //resetting when timer resets
    time = 0;
    timerPaused = false;
    timerIsActive = true;
    timerSkipped = false;
    waitCount = 1;
    timerHeader.textContent = 'Press \'Start\' to Begin';
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
    //default time values to 0
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
    if ((runCount - 1) > repeatAmountValue) {
        resetTimer();
    }
    else if (runCount % 2 == 0) {
        updateWorkTimer(workHourValue, workMinuteValue);
    }
    else {
        updateBreakTimer(breakHourValue, breakMinuteValue);
    }
}

//run when pause button is pressed
function pauseTimer() { 
    if (timerIsActive) {
        pauseCount++;
        if(pauseCount % 2 == 0) {
            pauseButton.textContent = 'Resume';
            timerHeader.textContent = 'Timer Paused';
            timerPaused = true;
        }
        else {
            pauseButton.textContent = 'Pause';
            timerPaused = false;
            if(nextTimer == 'Break') {
            timerHeader.textContent = 'Work Time Remaining';
            }
            else {
            timerHeader.textContent = 'Break Time Remaining';
            }
            loop();
        }
    }
}

//run when skip button is pressed
function skipTimer() {
    if (timerIsActive) {
        timerHeader.textContent = 'Timer Skipped';
        timerDisplay.textContent = ('--:--:--');
        timerSkipped = true; //default false, true if timer has been pressed
        runCount++;
        clearTimeout();
    }
}

//reset every time timer stops
function resetTimer() {
    clearTimeout();
    time = 0;
    timerIsActive = false;
    runCount = 0;
    waitCount = 1;
    timerHeader.textContent = 'Timer Reset';
    timerDisplay.textContent = ('--:--:--');
}

//work timer
function updateWorkTimer(hourValue, minuteValue) {
    timerHeader.textContent = `Work Time Remaining:`;
    nextTimer = 'Break';
    time = (hourValue * 3600) + (minuteValue * 60);
    loop();
}

//break timer
function updateBreakTimer(hourValue, minuteValue) {
    timerHeader.textContent = `Break Time Remaining:`;
    nextTimer = 'Work';
    time = (hourValue * 3600) + (minuteValue * 60);
    loop();
}

//timer manager
function loop() {
    //if timer isn't active, run resetTimer and wait for timer to become active
    if (timerIsActive) {
        //check if skip button has been pressed every time loop() is called
        if (timerSkipped) { 
            //getTimeRemaining(hourValue, minuteValue, timeEnd) == '00:00';
            timerDisplay.textContent = ('--:--:--');
            initializeTimer(); //restart timer with increased runCount, skipping timerSwitch and starting next timer
        }
        else if(timerPaused) {
            clearTimeout(x);
        }
        else if (time > -1) {
            var x = setTimeout(() => {
                time--;
                timerDisplay.textContent = getTimeRemaining();
                loop();
            }, 1000);
        }
        //if time has run out, switch to next timer
        else {
            runCount++;
            timerSwitch();
        }
    }   
    else {
        resetTimer();
    }
}

//countdown until next timer starts
function timerSwitch() {
    timerSkipped = false;
    //doesnt do countdown if timer should stop running
    if ((runCount - 1) > repeatAmountInput.value) {
        resetTimer();
    }
    else if (waitCount <= 4) {
        setTimeout(() => {
            timerHeader.textContent = ('Starting ' + nextTimer + ' Timer');
            timerDisplay.textContent = (waitCount + '...');
            waitCount++;
            timerSwitch();
        }, 1000);
    }
    else {
        //restart
        initializeTimer();
    }
}

//timer logic, calculates how much time is remaining on timer and outputs to screen
function getTimeRemaining() {
    //console.log('this part too');
    var timeRemainingOutput;
    var hours = Math.floor(time / 3600);
    var minutes = Math.floor(time / 60);
    if(minutes >= 60) {
        minutes -= 60;
    }
    var seconds = Math.floor(time % 60);

    if (hours <= 0) {
        timeRemainingOutput = `${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    else {
        timeRemainingOutput = `${('00' + hours).slice(-2)}:${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    
    return timeRemainingOutput;
}


