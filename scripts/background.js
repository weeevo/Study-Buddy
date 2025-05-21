let blockedSites = [];
let viewOnceTabId = null;

// this marks the start of the timer functionality
let timerData = {
  isRunning: false,
  phase: 'Work',
  remainingTime: 0,
  repeats: 0,
  pauseCount: 1,
  workDuration: 0,
  breakDuration: 0,
  intervalId: null,
  paused: false,
  theme: "dark"
};

function startTimer() {
  timerData.isRunning = true;
  timerData.phase = 'Work';
  runTimer(true);
}

function runTimer(resetRemainingTime = false) {
  if (resetRemainingTime) {
    const duration = timerData.phase === 'Work' ? timerData.workDuration : timerData.breakDuration;
    timerData.remainingTime = duration;
  }

  timerData.paused = false;
  saveTimerState();

  if (timerData.intervalId) clearInterval(timerData.intervalId);

  timerData.intervalId = setInterval(() => {
    updateUI();
    timerData.remainingTime = timerData.remainingTime - 1000;

    if (timerData.remainingTime < 0) {
      timerData.remainingTime = 0;
      clearInterval(timerData.intervalId);
      timerData.phase = timerData.phase === 'Work' ? 'Break' : 'Work';
      if (timerData.phase == "Work") { timerData.repeats--; }

      if ((timerData.repeats < 0)) {
        timerData.isRunning = false;
        timerData.remainingTime = 0;
        saveTimerState();

        chrome.runtime.sendMessage({ action: "endTimer" });
        notifyAllTabs();
        return;
      }

      notifyAllTabs()

      chrome.runtime.sendMessage({
        action: "switchTimer",
        data: {
          phase: timerData.phase
        }
      });
      setTimeout(() => {
        runTimer(true);
      }, 1500);
      return
    }

    saveTimerState();
  }, 1000);
}

// calls this every second to update the timer frontend
function updateUI() {
  chrome.storage.local.get(["timerData", "blockedSites"], () => {
    if (timerData.isRunning) {
      chrome.runtime.sendMessage({
        action: "updateUI",
        timerData: timerData,
        blockedSites: blockedSites
      })
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: "updateUI",
            timerData: timerData,
            blockedSites: blockedSites
          });
        });
      });
    }
  });
}

function updateTheme() {
  chrome.storage.local.get(["timerData"], () => {
    if (timerData.isRunning) {
      chrome.runtime.sendMessage({
        action: "updateTheme",
        theme: timerData.theme
      })
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: "updateTheme",
            theme: timerData.theme
          });
        });
      });
    }
  });
}

function saveTimerState() {
  chrome.storage.local.set({ timerData });

  if (timerData.isRunning) {
    const totalSeconds = Math.floor(timerData.remainingTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    let text;
    if(minutes == 0){ text = `${seconds}s`; }
    else { text = `${minutes}m`}
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: timerData.phase === "Work" ? "#d3191d" : "#edb110" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

function resetTimerState() {
  clearInterval(timerData.intervalId);

  timerData = {
    isRunning: false,
    remainingTime: 0,
    workDuration: 0,
    breakDuration: 0,
    repeats: 0,
    phase: "Work",
    intervalId: null,
    paused: false,
    theme: timerData.theme,
  };

  saveTimerState();
}

function pauseTimer() {
  if (timerData.intervalId) {
    clearInterval(timerData.intervalId);
    timerData.intervalId = null;
    timerData.paused = true;
    saveTimerState();
  }
}

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

function notifyAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: "timerPhaseChanged",
        newPhase: timerData.phase,
        isRunning: timerData.isRunning,
        workDur: timerData.workDuration,
        breakDur: timerData.breakDuration
      });
    })
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // whenever we start or unpause the timer
  if (request.action === "startTimer") {
    const { workHours, workMinutes, breakHours, breakMinutes, repeats } = request.data;
    timerData.workDuration = (workHours * 60 + workMinutes) * 60 * 1000;
    timerData.breakDuration = (breakHours * 60 + breakMinutes) * 60 * 1000;
    timerData.repeats = repeats;
    timerData.isRunning = true;
    // saveTimerState();
    updateUI();

    if (timerData.paused) {
      runTimer(false);
    } else {
      startTimer();
    }
  }
  //updates popup ui each time its opened
  else if (request.action == "updatePopup") {
    updateUI();
  }
  // resets the timer when reset button is pressed
  else if (request.action === "resetTimer") {
    notifyAllTabs();
    resetTimerState();
  }
  // skips to next timer
  else if (request.action === "skipTimer") {
    timerData.phase = timerData.phase === 'Work' ? 'Break' : 'Work';
    if (timerData.phase == "Work") {
      timerData.repeats--;
      timerData.remainingTime = timerData.workDuration;
    }
    else {
      timerData.remainingTime = timerData.breakDuration;
      removeOverlayAllTabs();
    }
    if ((timerData.repeats < 0)) {
      timerData.isRunning = false;
      timerData.remainingTime = 0;
      saveTimerState();

      chrome.runtime.sendMessage({ action: "endTimer" });
      notifyAllTabs();
      removeOverlayAllTabs();
      resetTimerState();
      return;
    }
    else {
      sendResponse({ timerData: timerData });
      setTimeout(() => {
        updateUI();
        notifyAllTabs();
        runTimer(true);
      }, 1000);
    }
  }
  // pauses
  else if (request.action === "pauseTimer") {
    pauseTimer();
  }
});

// saving and setting light and dark mode
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveTheme") {
    timerData.theme = request.theme;
    saveTimerState();
    updateTheme();
  }
  else if (request.action === "getTheme") {
    sendResponse(timerData.theme);
  }
});

// page blocking 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleBlockSite") {
    const url = new URL(request.url);
    const hostname = url.hostname.replace(/^www\./, "");
    chrome.storage.local.get("blockedSites", (result) => {
      let list = result.blockedSites || [];
      const index = list.indexOf(hostname);
      if (index === -1) {
        list.push(hostname);
      } else {
        list.splice(index, 1);
      }
      chrome.storage.local.set({ blockedSites: list });
      sendResponse({ updatedList: list });
    });
    return true;
  }
  else if (request.action === "blockSiteFromSearch") {
    const hostname = request.url;
    chrome.storage.local.get("blockedSites", (result) => {
      let list = result.blockedSites || [];
      const index = list.indexOf(hostname);
      if (index === -1) {
        list.push(hostname);
      }
      chrome.storage.local.set({ blockedSites: list });
      sendResponse({ updatedList: list });
    });
    return true;
  }
  else if (request.action === "getBlockedStatus") {
    const tabId = sender.tab.id;
    const url = new URL(request.url);
    const hostname = url.hostname.replace(/^www\./, "");
    chrome.storage.local.get(["timerData", "blockedSites", "viewOnceTabId"], (result) => {
      const isBlocked = 
        !result.blockedSites?.includes(hostname) &&
        result.timerData?.isRunning &&
        result.timerData?.phase === "Work" &&
        result.viewOnceTabId !== tabId &&
        result.remainingTime !== 0;
      // console.log("isblocked is " + isBlocked + " because:\nresult.blockedSites?.includes(hostname) is " + result.blockedSites?.includes(hostname) + " and\nresult.timerData?.isRunning is " + result.timerData?.isRunning + " and\nresult.timerData?.phase === 'Work' is " + (result.timerData?.phase === 'Work') + " and\nresult.viewOnceTabId !== tabId is " + (result.viewOnceTabId !== tabId) + " and\nresult.remainingTime !== 0 is " + (result.remainingTime !== 0) + "");
      sendResponse({ blocked: isBlocked, timerData: timerData });
    });
    return true;
  }
  else if (request.action === "removeBlockedSite") {
    chrome.storage.local.get("blockedSites", (data) => {
      const updated = (data.blockedSites || []).filter(site => site !== request.domain);
      chrome.storage.local.set({ blockedSites: updated });
    });
  }
  else if (request.action === "viewOnce") {
    viewOnceTabId = sender.tab.id;
    chrome.storage.local.set({ viewOnceTabId: sender.tab.id });
    chrome.tabs.sendMessage(viewOnceTabId, { action: "hideOverlay" });
  }
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (viewOnceTabId !== null && activeInfo.tabId !== viewOnceTabId) {
    // User switched away from view-once tab
    chrome.tabs.sendMessage(viewOnceTabId, { action: "showOverlay" });
    viewOnceTabId = null; // Reset
    chrome.storage.local.set({ viewOnceTabId: null });
  }
});

// When the user changes window focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return; // no window focused

  chrome.tabs.query({ active: true, windowId }, (tabs) => {
    if (tabs.length === 0) return;
    const activeTabId = tabs[0].id;
    if (viewOnceTabId !== null && activeTabId !== viewOnceTabId) {
      // User switched away
      chrome.tabs.sendMessage(viewOnceTabId, { action: "showOverlay" });
      viewOnceTabId = null;
      chrome.storage.local.set({ viewOnceTabId: null });
    }
  });
});
