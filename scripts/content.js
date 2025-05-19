let notifShadowRoot = null;
let overlayShadowRoot = null;

(function () {
  ensureOverlayInjected(0);
  chrome.runtime.sendMessage({ action: "getBlockedStatus", url: window.location.href }, (res) => {
    if (res.blocked) {
      ensureOverlayInjected(res.timerData.remainingTime)
      showOverlay();
    }
  });
})();

// really try hard to inject my overlay 
function ensureOverlayInjected(remainingTime) {
  const tryInject = () => {
    if (!document.getElementById("blocker-host")) {
      injectBlockingOverlay(remainingTime);
      injectNotif();
    }
  };

  // Retry after 3 seconds in case the page is still initializing
  setTimeout(tryInject, 3000);
  requestIdleCallback(tryInject);
}

// helper function to convert time in ms to hr:min:sec format
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

// injected page content
function injectBlockingOverlay(remainingTime) {
  if (document.getElementById("blocker-host")) showOverlay();

  const host = document.createElement("div");
  host.id = "blocker-host";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "100vw";
  host.style.height = "100vh";
  host.style.zIndex = "9999999";
  host.style.display = "none";
  host.style.pointerEvents = "none";

  overlayShadowRoot = host.attachShadow({ mode: "open" });
  
  const fontLink = document.createElement("link");
  const preconnect1 = document.createElement("link");
  const preconnect2 = document.createElement("link")

  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com"
  preconnect2.crossOrigin = "anonymous"
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Sofia+Sans+Condensed:ital,wght@0,1..1000;1,1..1000&display=swap";

  document.head.appendChild(preconnect1);
  document.head.appendChild(preconnect2);
  document.head.appendChild(fontLink);

  const style = document.createElement("style");
  style.textContent = `
    #site-blocker-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      backdrop-filter: blur(10px);
      background-color: rgba(36, 35, 35, .99);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      z-index: 999998;
      color: #ffffff;
      font-size: 100%;
    }

    h1{
      font-family: "DM Serif Display", serif;
      font-size: 80px !important;
      line-height: .8;
      margin-bottom: 20px;
      margin-top: 0;
      font-weight: 700;
    }

    p{
        font-family: "Sofia Sans Condensed", sans-serif;
        margin: 0;
        font-weight: 300;
        font-size: 40px !important;
        line-height: 1.1;
        max-width: 600px;
    }

    em{
      font-family: "DM Serif Display", serif;
      font-style: italic;
      font-weight: 700;
    }

    .title{
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 32px;
    }
    
    .buttons{
      z-index: 999999;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 16px;
      width: 1000px;
      justify-content: center;
      background-color: #2e2b2b;
      padding: 16px;
      box-sizing: border-box;
      border-radius: 50px;
      transition: background-color .5s ease;
    }

    .button {
      font-family: "Sofia Sans Condensed", sans-serif;
      border: 0;
      font-size: 32px !important;
      padding: 16px;
      padding-inline: 20px;
      border-radius: 100px;
      transition: all .1s ease;
      outline-offset: 2px;
      color: #ffffff;
    }

    .button:hover{
      cursor: pointer;
    }

    footer{
        position: absolute;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
        background-color: #2e2b2b;
        padding-inline: 16px;
        padding-block: 8px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        transition: background-color .5s ease;
    }

    #colorMode{
      font-family: "Sofia Sans Condensed", sans-serif;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 2px;
        font-size: 24px;
        font-weight: 200;
        font-style: italic;
        text-decoration: none;
        cursor: pointer;
    }

    .icon{
        fill: #ffffff;
        transform: translateY(-1px) scale(1);
        width: 30px;
        margin-left: 5px;
    }

    .yellow{
      background: linear-gradient( #edb110, #c78010);
      box-shadow: inset 0 -6.4px #9b6a1b;
    }

    .yellow:active{
        box-shadow: inset 0 6.4px #c59000;
        transform: translateY(2px);
    }

    .blue{
        background: linear-gradient( #2245d3, #1417bb);
        box-shadow: inset 0 -6.4px #0407a7;
    }

    .blue:active{
        box-shadow: inset 0 6.4px #0e2fb1;
        transform: translateY(2px);
    }

    .green{
        background: linear-gradient( #10cb00, #078f00);
        box-shadow: inset 0 -6.4px #1d740b;
    }

    .green:active{
        box-shadow: inset 0 6.4px #0ea506;
        transform: translateY(2px);
    }

    .red{
        background: linear-gradient( #d3191d, #ab1b1b);
        box-shadow: inset 0 -6.4px #890606;
    }

    .red:active{
        box-shadow: inset 0 -6.4px #ab0a0d;
        transform: translateY(2px);
    }
  `;

  const overlay = document.createElement("div");
  overlay.id = "site-blocker-overlay";
  overlay.setAttribute("data-theme", "dark")
  overlay.innerHTML = `
    <section class="title">
      <h1><span id="timer-header">It's work time. </span><em id="block-timer">${formatTime(remainingTime)}</em><em> Left</em></h1>
      <p>This page is being blocked by Study Buddy because it's in the list of blocked sites</p>
    </section>
    <section class="buttons">
      <button id="view-once" class="button yellow">View Once</button>
      <button id="remove-site" class="button blue">Unblock Site</button>
      <button id="start-break" class="button green">Start Break</button>
      <button id="end-timers" class="button red">End Timer</button>
    </section>
    <footer>
      <a id="colorMode">Switch to Light Mode
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
          width="24px">
          <path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z" />
        </svg>
      </a>
    </footer>
  `;

  overlayShadowRoot.appendChild(style);
  overlayShadowRoot.appendChild(overlay);
  getTheme(overlayShadowRoot);
  document.documentElement.appendChild(host);

  // Button actions
  overlayShadowRoot.getElementById("remove-site").onclick = () => {
    chrome.runtime.sendMessage({ action: "toggleBlockSite", url: window.location.href });
    removeOverlay();
  };

  overlayShadowRoot.getElementById("view-once").onclick = () => {
    viewOnce();
  };

  overlayShadowRoot.getElementById("start-break").onclick = () => {
    chrome.runtime.sendMessage({ action: "skipTimer" });
    removeOverlay();
  };

  overlayShadowRoot.getElementById("end-timers").onclick = () => {
    chrome.runtime.sendMessage({ action: "resetTimer" });
    removeOverlay();
  };

  overlayShadowRoot.getElementById("colorMode").onclick = () => {
    currentThemeSetting = overlayShadowRoot.querySelector("#site-blocker-overlay").getAttribute("data-theme");
    let newTheme = currentThemeSetting === "dark" ? "light" : "dark";

    if (newTheme == "dark") { changeToDark(overlayShadowRoot) }
    else { changeToLight(overlayShadowRoot) }

    overlayShadowRoot.querySelector("#site-blocker-overlay").setAttribute("data-theme", newTheme);
    chrome.runtime.sendMessage({
      action: "saveTheme",
      theme: newTheme,
    });
  }

  // observer to prevent removal
  const observer = new MutationObserver(() => {
    if (!document.body.contains(host)) {
      document.body.appendChild(host);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

//updating UI every time theres an update
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "updateUI") {
    chrome.runtime.sendMessage({ action: "getBlockedStatus", url: window.location.href }, (res) => {
      if(!res) return;
      if (!res.blocked) {
        removeOverlay();
        return;
      }
    });
    const timerData = request.timerData;
    const timerEl = overlayShadowRoot.getElementById("block-timer");
    const timerh1 = overlayShadowRoot.getElementById("timer-header");
    timerEl.textContent = formatTime(timerData.remainingTime);
    if (timerData.paused) {
      timerh1.textContent = "Timer paused. "
    }
    else if (timerData.phase == "Work" && timerData.isRunning) {
      timerh1.textContent = "It's work time. "
      showOverlay();
    }
  }
})

// notif when timers switch or end
function injectNotif() {
  if (document.getElementById("notif")) return;

  const host = document.createElement("div");
  host.id = "notif-shadow-root";
  host.style.zIndex = "999999"
  document.body.appendChild(host);

  notifShadowRoot = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
          #notif{
            display: flex;
            align-items: center;
            width: 550px;
            margin-left: -275px;
            color: white;
            background: linear-gradient( #10cb00, #078f00);
            box-shadow: 0 4px 0 0 #1d740b;
            border-radius: 32px 50px 50px 32px;
            position: fixed;
            left: 50%; 
            z-index: 99999999;
            bottom: -200px;
            transition: bottom .5s ease;
        }

        #timerLength{
            font-family: "DM Serif Display", serif;
            font-style: italic;
            font-size: 48px;
            font-weight: 700;
            background-color: #54564f;
            border-radius: 18px;
            box-shadow: inset 0 0 5px 3px #3c3e38;
            text-align: center;
            padding: 16px;
            padding-inline: 24px;
            width: 200px;
        }

        #content{
            display: flex;
            align-items: center;
            line-height: 1;
            font-family: "Sofia Sans Condensed", sans-serif;
            font-size: 32px;
            text-align: right;
            background: #242323;
            box-shadow: 0 4px 0 0 #181818;
            border-radius: 0 32px 32px 0;
            gap: 24px;
            padding: 12px;
        }

        #notif p{
            margin: 0;
            text-align: right;
        }

        .icon {
            fill: white;
            height: 40px;
        }

        .thumb-up{
            display: flex;
            justify-content: center;
            width: 100%;
        }

        #notif.show {
          bottom: 60px;
        }
          
        #close-notif{
            display: flex;
            align-items: center;
            padding-inline: 16px;
            padding-block: 20px;
            border: 0;
            background: none;
        }

        #close-notif:hover{
            cursor: pointer;
        }
      `
  const notif = document.createElement("div");
  notif.id = "notif";
  // notif.classList.add("show");
  notif.innerHTML = `    
        <button id="close-notif">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </button>
        <div id="content">
            <p id="popupText">The break is over. It's work time for the next</p>
            <div id="timerLength">25:00</div>
        </div>
    `
  notifShadowRoot.appendChild(style);
  notifShadowRoot.appendChild(notif)

  notifShadowRoot.getElementById("close-notif").onclick = () => {
    notif.classList.remove("show");
  }
}

function showNotif(message, dur) {
  if (!notifShadowRoot) return;

  const notif = notifShadowRoot.getElementById("notif");
  if (!notif) return;

  notifShadowRoot.getElementById("popupText").textContent = message;
  notifShadowRoot.getElementById("timerLength").innerHTML = dur;
  notif.classList.add("show");

  setTimeout(() => {
    notif.classList.remove("show");
  }, 10000);
}

function removeOverlay() {
  const overlay = document.getElementById("blocker-host");
  if (overlay) {
    overlay.style.display = "none";
    overlay.style.pointerEvents = "none"
  }
}

function showOverlay() {
  if (!overlayShadowRoot) return;

  const overlay = document.getElementById("blocker-host");
  if (!overlay) return;

  if (overlay) {
    // overlay.style.display = "flex";
    overlay.style.display = "flex";
    overlay.style.pointerEvents = "auto"
  }
}

function viewOnce() {
  chrome.runtime.sendMessage({ action: "viewOnce" })
  removeOverlay();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "hideOverlay":
      removeOverlay(); // function to remove/hide overlay
      break;
    case "showOverlay":
      injectBlockingOverlay(); // if you want to re-show it
      break;
    case "viewOnce":
      viewOnce(); // disable overlay just once for this tab
      break;
    case "removeFromBlocked":
      chrome.runtime.sendMessage({ action: "toggleBlockSite", url: window.location.href });
      break;
    case "timerPhaseChanged":
      timerSwitchAlert(request.isRunning, request.newPhase, request.workDur, request.breakDur)
      break;
    case "updateTheme":
      if(request.theme == "dark") {changeToDark(overlayShadowRoot);}
      else {changeToLight(overlayShadowRoot);}
      break;
  }
});

function timerSwitchAlert(active, phase, workDur, breakDur) {
  if (!active) {
    showNotif("Focus session done. Good Work!", '<svg class="icon thumb-up" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>')
    removeOverlay();
  }
  else if (phase === "Work") {
    let time = formatTime(workDur)
    showNotif("The break is over. It's work time for the next", time)
    showOverlay();
  }
  else {
    let time = formatTime(breakDur);
    showNotif("You've earned a break! Work starts again in", time)
    removeOverlay();
  }
}


// get theme when the overlay first loads
function getTheme(shadow) {
  chrome.runtime.sendMessage({ action: "getTheme" }, (response) => {
    if (response == "dark") { changeToDark(shadow) }
    else { changeToLight(shadow) }
  });
}

// change colors to light mode colors and set theme to light
function changeToLight(shadow) {
  shadow.querySelector("#site-blocker-overlay").setAttribute("data-theme", "light");
  shadow.getElementById("colorMode").innerHTML = 'Switch to Dark Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>';
  // changing colors
  // page and section background color
  shadow.querySelector("#site-blocker-overlay").style.backgroundColor = "rgba(230, 230, 230, .99)"
  shadow.querySelector(".buttons").style.backgroundColor = "#f4f5f6"
  shadow.querySelector("footer").style.backgroundColor = "#f4f5f6"

  // text color
  shadow.querySelector(".title").style.color = "#000000"
  shadow.querySelector("#colorMode").style.color = "#000000"
  shadow.querySelector(".icon").style.fill = "#000000"

  // button colors
  shadow.querySelector(".yellow").style.background = "linear-gradient( #F8C63F, #E4A238)";
  shadow.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #CD9131";
  shadow.querySelector(".yellow").addEventListener("mousedown", () => { shadow.querySelector(".yellow").style.boxShadow = "inset 0 6.4px #D8AB34" });
  shadow.querySelector(".yellow").addEventListener("mouseup", () => { shadow.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #CD9131" });

  shadow.querySelector(".blue").style.background = "linear-gradient( #3F64F8, #383BE4)";
  shadow.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #3134CD";
  shadow.querySelector(".blue").addEventListener("mousedown", () => { shadow.querySelector(".blue").style.boxShadow = "inset 0 6.4px #3455D8" });
  shadow.querySelector(".blue").addEventListener("mouseup", () => { shadow.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #3134CD" });

  shadow.querySelector(".green").style.background = "linear-gradient( #55D34A, #34A92E)";
  shadow.querySelector(".green").style.boxShadow = "inset 0 -6.4px #32941E";
  shadow.querySelector(".green").addEventListener("mousedown", () => { shadow.querySelector(".green").style.boxShadow = "inset 0 6.4px #3FC038" });
  shadow.querySelector(".green").addEventListener("mouseup", () => { shadow.querySelector(".green").style.boxShadow = "inset 0 -6.4px  #32941E" });

  shadow.querySelector(".red").style.background = "linear-gradient( #E24F52, #C52F2F)";
  shadow.querySelector(".red").style.boxShadow = "inset 0 -6.4px #BA2222";
  shadow.querySelector(".red").addEventListener("mousedown", () => { shadow.querySelector(".red").style.boxShadow = "inset 0 6.4px #D9393C" });
  shadow.querySelector(".red").addEventListener("mouseup", () => { shadow.querySelector(".red").style.boxShadow = "inset 0 -6.4px #BA2222" });
}

// change colors to dark mode colors and set theme to dark
function changeToDark(shadow) {
  shadow.querySelector("#site-blocker-overlay").setAttribute("data-theme", "dark");
  shadow.getElementById("colorMode").innerHTML = 'Switch to Light Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>';
  // changing colors
  // page and section background colors
  shadow.querySelector("#site-blocker-overlay").style.backgroundColor = "rgba(36, 35, 35, .99)"
  shadow.querySelector(".buttons").style.backgroundColor = "#2e2b2b"
  shadow.querySelector("footer").style.backgroundColor = "#2e2b2b";

  //text colors
  shadow.querySelector(".title").style.color = "#ffffff"
  shadow.querySelector("#colorMode").style.color = "#ffffff"
  shadow.querySelector(".icon").style.fill = "#ffffff"

  // button colors
  shadow.querySelector(".yellow").style.background = "linear-gradient( #edb110, #c78010)";
  shadow.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #9b6a1b";
  shadow.querySelector(".yellow").addEventListener("mousedown", () => { shadow.querySelector(".yellow").style.boxShadow = "inset 0 6.4px #c59000" });
  shadow.querySelector(".yellow").addEventListener("mouseup", () => { shadow.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #9b6a1b" });

  shadow.querySelector(".blue").style.background = "linear-gradient( #2245d3, #1417bb)";
  shadow.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #0407a7";
  shadow.querySelector(".blue").addEventListener("mousedown", () => { shadow.querySelector(".blue").style.boxShadow = "inset 0 6.4px #0e2fb1" });
  shadow.querySelector(".blue").addEventListener("mouseup", () => { shadow.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #0407a7" });

  shadow.querySelector(".green").style.background = "linear-gradient( #10cb00, #078f00)";
  shadow.querySelector(".green").style.boxShadow = "inset 0 -6.4px #1d740b";
  shadow.querySelector(".green").addEventListener("mousedown", () => { shadow.querySelector(".green").style.boxShadow = "inset 0 6.4px #0ea506" });
  shadow.querySelector(".green").addEventListener("mouseup", () => { shadow.querySelector(".green").style.boxShadow = "inset 0 -6.4px  #1d740b" });

  shadow.querySelector(".red").style.background = "linear-gradient( #d3191d, #ab1b1b)";
  shadow.querySelector(".red").style.boxShadow = "inset 0 -6.4px #890606";
  shadow.querySelector(".red").addEventListener("mousedown", () => { shadow.querySelector(".red").style.boxShadow = "inset 0 6.4px #ab0a0d" });
  shadow.querySelector(".red").addEventListener("mouseup", () => { shadow.querySelector(".red").style.boxShadow = "inset 0 -6.4px #890606" });
}