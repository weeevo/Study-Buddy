
//application variables
var activeTabHostname = ""; //this is the host name of the tab the user is currently on
var permittedSites = []; //this will hold the array of user added permitted sites

//declaring counters
var runCount = 0;
var waitCount = 1;
var pauseCount = 1;

//declaring timer functionality variables
var x; //setTimeout later
var time;
var nextTimer;
var timerIsActive = false;
var timerSkipped = false;
var timerPaused = false;



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

const addSiteButton = document.getElementById('btnAddSite');

const siteList = document.getElementById("siteList");









// // document.addEventListener('DOMContentLoaded', function() {

// //     // // Load the saved value when the options page is opened
// //     // chrome.storage.sync.get(['savedValue'], function(result) {
// //     //   userInput.value = result.savedValue || '';
// //     // });
  
    
// // });

//this function is called when the html page is loaded
document.addEventListener('DOMContentLoaded', function() {

    

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        //alert('hi');
        var activeTab = tabs[0];
        
        var activeTabURL = activeTab.url;
        activeTabHostname = getHostnameFromUrl(activeTabURL);
        document.getElementById('activeTabURL').textContent = activeTabHostname;
    
        if (permittedSites.includes(activeTabHostname)) {
            //alert(activeTabHostname + " is in the array.");
            document.getElementById('url_zone').style.display = "none";
        } else {
            //alert(activeTabHostname + " is not in the array.");
            switch (activeTabHostname) {
                case "newtab":
                case "extensions":
                    document.getElementById('url_zone').style.display = "none";
                    break;
                default:
                    document.getElementById('url_zone').style.display = "block";
                    break;
            }
            
            // chrome.tabs.executeScript(activeTab.id, {
            //     code: `
            //         // Create a div element for the blank screen
            //         const blankScreen = document.createElement('div');
            //         blankScreen.style.position = 'fixed';
            //         blankScreen.style.top = '0';
            //         blankScreen.style.left = '0';
            //         blankScreen.style.width = '100%';
            //         blankScreen.style.height = '100%';
            //         blankScreen.style.background = 'white'; // Set the background color you want
            //         blankScreen.style.zIndex = '9999'; // A high z-index to cover everything
 
            //         // Inject the div into the page
            //         document.body.appendChild(blankScreen);
            //     `
            // });
            
          }


        
        
    });



    chrome.storage.sync.get(['permittedSites'], function(result) {
        permittedSites = result.permittedSites;
        //alert('sites loaded: ' + permittedSites);
        permittedSites.forEach(function(site) {
            var listItem = document.createElement("li");
            listItem.textContent = site;
            siteList.appendChild(listItem);
        });

        
        

    });


    

    


});

//event listeners
startButton.addEventListener("click", initializeTimer);
resetButton.addEventListener("click", resetTimer);
pauseButton.addEventListener("click", pauseTimer);
skipButton.addEventListener("click", skipTimer);
addSiteButton.addEventListener("click", addPermittedSite);







function addPermittedSite(){
    

    //add new value to the beginning of the array
    permittedSites.unshift(activeTabHostname);
    
    //alert("new sites: " + permittedSites);
    
    
    //save array to storage
    chrome.storage.sync.set({ 'permittedSites': permittedSites }, function() {
        // Notify the user that the data has been saved
        alert('Value saved: ' + permittedSites);
    });
}
    

function getHostnameFromUrl(activeTabUrl) {
    try {
        const url = new URL(activeTabUrl);
        return url.hostname;
    } catch (error) {
        // Handle invalid URLs
        console.error("Invalid URL:", activeTabUrl);
        return null;
    }
}

function initializeTimer() {
    //resetting when timer resets
    time = 0;
    waitCount = 1;
    timerPaused = false;
    timerIsActive = true;
    timerSkipped = false;
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
        clearTimeout(x);
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
    }
}

//reset every time timer stops
function resetTimer() {
    //resetting everythinggggggggg
    clearTimeout(x);
    timerPaused = false;
    timerIsActive = false;
    time = 0;
    pauseCount = 1;
    runCount = 0;
    waitCount = 1;
    pauseButton.textContent = 'Pause';
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
            clearTimeout(x);
            timerDisplay.textContent = ('--:--:--');
            initializeTimer(); //restart timer with increased runCount, skipping timerSwitch and starting next timer
        }
        else if(timerPaused) {
            clearTimeout(x);
        }
        else if (time >= 0) {
            x = setTimeout(() => {
                timerDisplay.textContent = getTimeRemaining();
                time--;
                loop();
            }, 1000);
        }
        //if time has run out, switch to next timer
        else {
            runCount++;
            clearTimeout(x);
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
    var hours = Math.floor(time / 3600);
    var minutes = Math.floor(time / 60);
    if(minutes >= 60) {
        minutes -= 60;
    }
    var seconds = Math.floor(time % 60);

    if (hours <= 0) {
        var timeRemainingOutput = `${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    else {
        var timeRemainingOutput = `${('00' + hours).slice(-2)}:${('00' + minutes).slice(-2)}:${('00' + seconds).slice(-2)}`;
    }
    
    return timeRemainingOutput;
}


