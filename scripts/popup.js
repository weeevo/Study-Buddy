//tabs
const timerTab = document.getElementById("timerTab");
const timer = document.getElementById("timer");
const sitesTab = document.getElementById("sitesTab");
const sites = document.getElementById("sites");

if (timerTab.classList.contains("activeTab")) {
    timer.style.display = "flex"
    sites.style.display = "none"
}
else {
    sites.style.display = "flex";
    timer.style.display = "none";
}

//screen content
const colorMode = document.getElementById("colorMode");
const display = document.getElementById('display');
const set = document.getElementById('set');
const timerHeader = document.getElementById("currTimer");
const timerDisplay = document.getElementById("clock");
const repeatNum = document.getElementById("repeatsLeft");
document.getElementById("switch").style.display = "none";
document.getElementById("end").style.display = "none";
document.getElementById("skipScreen").style.display = "none";

//timer
const workHourInput = document.getElementById('workHours');
const workMinuteInput = document.getElementById('workMinutes');
const breakHourInput = document.getElementById('breakHours');
const breakMinuteInput = document.getElementById('breakMinutes');
const radios = document.getElementsByName("repeatVal");
const other = document.getElementById("otherVal");
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const skipButton = document.getElementById('skip');

let workHourValue;
let workMinuteValue;
let breakHourValue;
let breakMinuteValue;

//site
const addButton = document.getElementById('add');
const addLabel = document.getElementById('addLabel');
const activeTabURL = document.getElementById('activeTabURL');
const siteList = document.getElementById("siteList");
const typeURL = document.getElementById("typeURL");
const addURL = document.getElementById("addURL");

//event listeners
timerTab.addEventListener("click", () => {
    timer.style.display = "flex";
    timerTab.classList.add("activeTab");
    sites.style.display = "none";
    sitesTab.classList.remove("activeTab");
})

sitesTab.addEventListener("click", () => {
    timer.style.display = "none";
    timerTab.classList.remove("activeTab");
    sites.style.display = "flex";
    sitesTab.classList.add("activeTab");
})

colorMode.addEventListener("click", () => {
    currentThemeSetting = document.querySelector("html").getAttribute("data-theme");
    let newTheme = currentThemeSetting === "dark" ? "light" : "dark";
    if (newTheme == "dark") {
        colorMode.innerHTML = 'Switch to Light Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>';
        document.querySelector("html").setAttribute("data-theme", "light");
    }
    else {
        colorMode.innerHTML = 'Switch to Dark Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>';
        document.querySelector("html").setAttribute("data-theme", "dark");
    }
    document.querySelector("html").setAttribute("data-theme", newTheme);
    chrome.runtime.sendMessage({
        action: "saveTheme",
        theme: newTheme,
    });
});

other.addEventListener("click", () => { radios[2].checked = true; })
resetButton.addEventListener("click", resetTimer);
skipButton.addEventListener("click", skipTimer);

startButton.addEventListener("click", () => {
    if (startButton.dataset.paused === "true") {
        chrome.runtime.sendMessage({ action: "startTimer" });
        startButton.dataset.paused = "false";
        startButton.style.display = "block";
        stopButton.style.display = "none";
    } else {
        initializeTimer();
    }
});

stopButton.addEventListener("click", pauseTimer);

function initializeTimer() {
    workHourValue = parseFloat(workHourInput.value) || 0;
    workMinuteValue = parseFloat(workMinuteInput.value) || 25;
    breakHourValue = parseFloat(breakHourInput.value) || 0;
    breakMinuteValue = parseFloat(breakMinuteInput.value) || 10;

    let repeatAmountValue = 0; // Default
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            repeatAmountValue = i === 2 ? parseInt(other.value) || 2 : parseInt(radios[i].value);
        }
    }

    chrome.runtime.sendMessage({
        action: "startTimer",
        data: {
            workMinutes: workMinuteValue,
            workHours: workHourValue,
            breakMinutes: breakMinuteValue,
            breakHours: breakHourValue,
            repeats: repeatAmountValue
        }
    });

    let timerData =
    {
        remainingTime: (workHourValue * 60 + workMinuteValue) * 60 * 1000,
        phase: "Work",
        repeats: repeatAmountValue,
        paused: false,
    };

    renderTimerState(timerData);
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                action: "updateUI",
                timerData: timerData,
            });
        });
    });
}

function renderTimerState(timerData) {
    startButton.style.display = "none";
    stopButton.style.display = "block";
    set.style.display = "none";
    display.style.display = "flex";

    const { remainingTime, phase, repeats, paused } = timerData;
    let timeString = formatTime(remainingTime);
    timerDisplay.textContent = timeString;
    repeatNum.textContent = repeats;
    if (paused) {
        startButton.style.display = "block";
        stopButton.style.display = "none";
        timerHeader.innerHTML = '<p>Timer</p> <h1 style="margin: 0">Paused</h1>'
    }
    else if (phase === "Work") {
        timerHeader.innerHTML = '<p>Left to</p> <h1 style="margin: 0">Work</h1>'
    }
    else {
        timerHeader.innerHTML = '<p>Left on</p> <h1 style="margin: 0">Break</h1>';
    }
}

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }
}

function resetTimer() {
    chrome.runtime.sendMessage({ action: "resetTimer" })
    removeOverlayAllTabs()

    workHourInput.value = '';
    workMinuteInput.value = '';
    breakHourInput.value = '';
    breakMinuteInput.value = '';
    other.value = '';
    radios[0].checked = true; // or whichever you want as default
    startButton.style.display = "block";
    stopButton.style.display = "none";
    set.style.display = "grid";
    display.style.display = "none";
    timerActive = false;
}

function skipTimer() {
    chrome.runtime.sendMessage({ action: "skipTimer" }, (response) => {
        if (!response) {
            removeOverlayAllTabs()
            endTimer();
        }
        else {
            timerHeader.style.display = 'none';
            timerDisplay.style.display = 'none';
            document.getElementById("skipScreen").style.display = "flex";
            setTimeout(() => {
                timerHeader.style.display = 'flex';
                timerDisplay.style.display = 'flex';
                document.getElementById("skipScreen").style.display = "none";
                renderTimerState(response.timerData);
            }, 1000);
        }
    });
}

function pauseTimer() {
    chrome.runtime.sendMessage({ action: "pauseTimer" });
    startButton.style.display = "block";
    stopButton.style.display = "none";
    timerHeader.innerHTML = '<p>Timer</p> <h1 style="margin: 0">Paused</h1>'
}

function endTimer() {
    timerHeader.style.display = "none";
    timerDisplay.style.display = "none";
    document.getElementById("skipScreen").style.display = "none";
    document.getElementById("end").style.display = "flex";
    setTimeout(() => {
        timerHeader.style.display = "flex";
        timerDisplay.style.display = "flex";
        document.getElementById("end").style.display = "none";
        resetTimer();
    }, 2000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "switchTimer") {
        document.getElementById("next").textContent = request.data.phase;
        timerHeader.style.display = "none";
        timerDisplay.style.display = "none";
        document.getElementById("switch").style.display = "flex";
        setTimeout(() => {
            timerHeader.style.display = "flex";
            timerDisplay.style.display = "flex";
            document.getElementById("switch").style.display = "none";
        }, 2000);
    }
    else if (request.action == "endTimer") {
        endTimer()
    }
    else if (request.action == "updateUI") {
        renderTimerState(request.timerData);
    }
    if(request.action === "updateTheme"){
        changeTheme(request.theme);
    }
});

// ask for UI updates whenever the popup is opened
chrome.runtime.sendMessage({ action: "updatePopup" });

//changing the theme
chrome.runtime.sendMessage({ action: "getTheme" }, (response) => {
    changeTheme(response);
});

function changeTheme(theme) {
    if (theme == "dark") {
        colorMode.innerHTML = 'Switch to Light Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>';
        document.querySelector("html").setAttribute("data-theme", "dark");
    }
    else {
        colorMode.innerHTML = 'Switch to Dark Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>';
        document.querySelector("html").setAttribute("data-theme", "light");
    }
}

//start of site blocking functionality
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname.replace(/^www\./, "");

    switch (hostname) {
        case "newtab":
        case "extensions":
            addButton.classList.add("disabled");
            break
        default:
            addButton.classList.remove("disabled");
            break
    }

    function renderButtonAndList(blockedSites) {
        const isBlocked = blockedSites.includes(hostname);
        addLabel.textContent = isBlocked ? `Remove ` : `Add`;
        activeTabURL.textContent = hostname;

        // Clear and rebuild the list
        siteList.innerHTML = '';
        blockedSites.forEach(site => {
            // creating the content for each list item
            const div = document.createElement('div');
            div.classList.add("list-item");
            const text = document.createTextNode(site);
            const img = document.createElement('img');
            const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${site}`;
            img.src = favicon;
            div.appendChild(img);
            div.appendChild(text);

            // creating the list item
            const item = document.createElement('li');
            item.appendChild(div);
            item.onclick = () => {
                // Remove site when list item is clicked
                chrome.runtime.sendMessage({ action: "toggleBlockSite", url: `https://${site}` }, (res) => {
                    renderButtonAndList(res.updatedList);
                });
            };
            siteList.appendChild(item);
        });
    }

    chrome.storage.local.get("blockedSites", (res) => {
        renderButtonAndList(res.blockedSites || []);
    });

    addButton.onclick = () => {
        chrome.runtime.sendMessage({ action: "toggleBlockSite", url: tabs[0].url }, (res) => {
            renderButtonAndList(res.updatedList);
        });
    };

    addURL.onclick = () => {
        if (typeURL.value !== "") {
            chrome.runtime.sendMessage({ action: "blockSiteFromSearch", url: typeURL.value }, (res) => {
                renderButtonAndList(res.updatedList);
            });
        }
    }
});

function removeOverlayAllTabs() {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { action: "hideOverlay" });
        });
    });
}

function removeOverlayActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "viewOnce" });
        }
    });
}