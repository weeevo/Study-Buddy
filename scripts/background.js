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
    timerData.remainingTime = timerData.remainingTime - 1000;

    if (timerData.remainingTime < 0) {
      clearInterval(timerData.intervalId);
      timerData.phase = timerData.phase === 'Work' ? 'Break' : 'Work';
      if (timerData.phase == "Work") { timerData.repeats--; }

      if ((timerData.repeats < 0)) {
        timerData.isRunning = false;
        timerData.remainingTime = 0;
        saveTimerState();

        chrome.runtime.sendMessage({ action: "endTimer" });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0) return;
          chrome.tabs.sendMessage(tabs[0].id, { action: "timerEndAlert" });
        });
        return;
      }

      notifyActiveTab(timerData.phase, timerData.workDuration, timerData.breakDuration)

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

function saveTimerState() {
  chrome.storage.local.set({ timerData });

  if (timerData.isRunning) {
    const totalSeconds = Math.floor(timerData.remainingTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const text = `${minutes}:${String(seconds).padStart(2, "0")}`;
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

function notifyActiveTab(phase) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "timerPhaseChanged",
      newPhase: phase,
      workDur: timerData.workDuration,
      breakDur: timerData.breakDuration
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // whenever we start or unpause the timer
  if (request.action === "startTimer") {
    const { workHours, workMinutes, breakHours, breakMinutes, repeats } = request.data;
    timerData.workDuration = (workHours * 60 + workMinutes) * 60 * 1000;
    timerData.breakDuration = (breakHours * 60 + breakMinutes) * 60 * 1000;
    timerData.repeats = repeats;

    if (timerData.paused) {
      runTimer(false);
    } else {
      startTimer();
    }
  }
  // calls this every second to update the timer frontend
  else if (request.action === "getTimerState") {
    chrome.storage.local.get(["timerData", "blockedSites"], (data) => {
      if (timerData.isRunning) {
        sendResponse({
          timerData: data.timerData || timerData,
          blockedSites: data.blockedSites || []
        });
      }
    });
    return true; // Important: allows async sendResponse
  }
  // resets the timer when reset button is pressed
  else if (request.action === "resetTimer") {
    resetTimerState();
  }
  // skips to next timer
  else if (request.action === "skipTimer") {
    timerData.phase = timerData.phase === 'Work' ? 'Break' : 'Work';
    if (timerData.phase == "Work") { timerData.repeats--; }
    if ((timerData.repeats < 0)) {
      timerData.isRunning = false;
      timerData.remainingTime = 0;
      saveTimerState();

      chrome.runtime.sendMessage({ action: "endTimer" });
      chrome.tabs.sendMessage(tabs[0].id, { action: "timerEndAlert" });
      removeOverlayAllTabs();
      sendResponse("timer finished");
      return;
    }
    else {
      setTimeout(() => {
        notifyActiveTab(timerData.phase, timerData.workDuration, timerData.breakDuration);
        runTimer(true);
      }, 600);
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
    console.log(sender.tab.id);
    const tabId = sender.tab.id;
    const url = new URL(request.url);
    const hostname = url.hostname.replace(/^www\./, "");
    chrome.storage.local.get(["timerData", "blockedSites", "viewOnceTabId"], (result) => {
      const isBlocked = result.blockedSites?.includes(hostname) &&
        result.timerData?.isRunning &&
        result.timerData?.phase === "Work" &&
        result.viewOnceTabId !== tabId;
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
