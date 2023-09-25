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

//declaring basic variables
var count = 0;
var waitCount;
var pauseCount = 1;

var nextTimer;
var timerIsActive = false;
var timerSkipped = false;
var timerPaused = false;
var timeEnd;
var duration;

function initializeTimer() {
    //resetting the display every time the timer resets
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

//run when pause button is pressed
function pauseTimer() {
    /* what it will do
        1. freeze countdown clock at the current time it's at
            - get time at button press, add to duration for each loop
        2. change text on button to 'Resume'
        3. if pressed again, start countdown clock where it was left off
        4. change text on button to 'Pause'
        5. change header to '______ Timer Paused', blank for which timer is currently running
    */
    if (timerIsActive) {
        timerPaused = true;
        console.log('pressed pause')
        pauseCount++;
        if(pauseCount % 2 == 0) {
            pauseButton.textContent = 'Resume';
        }
        else {
            pauseButton.textContent = 'Pause';
        }
    }
}

//run when skip button is pressed
function skipTimer() {
    if (timerIsActive) {
        timerHeader.textContent = 'Timer Skipped';
        timerDisplay.textContent = ('--:--:--');
        timerSkipped = true; //default false, true if timer has been pressed
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
    timerHeader.textContent = 'Timer Reset';
    timerDisplay.textContent = ('--:--:--');
}

//work timer
function updateWorkTimer(hourValue, minuteValue) {
    timerHeader.textContent = `Work Time Remaining:`;
    nextTimer = 'Break';
    var timeStart = new Date().getTime(); //only used to calculate end time
    timeEnd = (timeStart + (hourValue * 3600000) + (minuteValue * 60000));

    loop(hourValue, minuteValue, timeEnd);
}

//break timer
function updateBreakTimer(hourValue, minuteValue) {
    timerHeader.textContent = `Break Time Remaining:`;
    nextTimer = 'Work';
    var timeStart = new Date().getTime();//only used to calculate end time
    timeEnd = ((timeStart) + (hourValue * 3600000) + (minuteValue * 60000));

    loop(hourValue, minuteValue, timeEnd);
}

//timer manager
function loop(hourValue, minuteValue, timeEnd) {
    //if timer isn't active, run resetTimer and wait for timer to become active
    if (timerIsActive) {
        //check if skip button has been pressed every time loop() is called
        if (timerSkipped) { 
            getTimeRemaining(hourValue, minuteValue, timeEnd) == '00:00';
            timerDisplay.textContent = ('--:--:--');
            initializeTimer(); //restart timer with increased count, skipping timerSwitch and starting next timer
        }
        //
        else if (getTimeRemaining(hourValue, minuteValue, timeEnd) != '00:00') {
            setTimeout(() => {
                timerDisplay.textContent = getTimeRemaining(hourValue, minuteValue, timeEnd);
                loop(hourValue, minuteValue, timeEnd);
            }, 1000);
        }
        //if time has run out, switch to next timer
        else {
            count++;
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
    if ((count - 1) > repeatAmountInput.value) {
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
function getTimeRemaining(hourValue, minuteValue, timeEnd) {
    //console.log('this part too');
    var timeRemainingOutput;
    var timeNow = new Date().getTime();
    duration = (timeEnd - timeNow) + 2000;

    hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((duration % (1000 * 60)) / 1000);

    if (hourValue == 0 || hours == 0) {
        timeRemainingOutput = `${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    else {
        timeRemainingOutput = `${('00' + hours).slice(-2)}:${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    
    return timeRemainingOutput;
}


