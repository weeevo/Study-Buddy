let notifShadowRoot = null;
let overlayShadowRoot = null;

(function () {
  ensureOverlayInjected(0);
})();

// really try hard to inject my overlay 
async function ensureOverlayInjected(remainingTime) {
  await preloadFonts();
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

function formatTimeMinutes(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = totalSeconds / 60;
  if(Math.floor(minutes) <= 0){
    return [false, totalSeconds];
  }
  return [true, minutes];
}

// injected page content
function injectBlockingOverlay(remainingTime) {
  const host = document.createElement("div");
  host.id = "blocker-host";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.padding = "0";
  host.style.margin = "0";
  host.style.border = "0";
  host.style.width = "100vw";
  host.style.height = "100vh";
  host.style.zIndex = "9999999";
  host.style.display = "none";
  host.style.pointerEvents = "none";

  overlayShadowRoot = host.attachShadow({ mode: "open" });
  chrome.storage.local.get(["colors"], (result) => {
    const stored = result.colors || {};
    const color1 = stored.color1 ?? "#edb110";
    const color2 = stored.color2 ?? "#2245d3";
    const color3 = stored.color3 ?? "#10cb00";
    const color4 = stored.color4 ?? "#d3191d";

    const style = document.createElement("style");
    style.textContent = generateStyleString({ color1, color2, color3, color4 });
    overlayShadowRoot.appendChild(style);
  });

  const SSC300 = chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-300.woff2');
  const SSC400 = chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-regular.woff2');
  const SSC200 = chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-200italic.woff2');
  const DMSregular = chrome.runtime.getURL('fonts/dm-serif-display-v15-latin-regular.woff2');
  const DMSitalic = chrome.runtime.getURL('fonts/dm-serif-display-v15-latin-italic.woff2');

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-display: swap;
      font-family: 'Sofia Sans Condensed';
      font-style: normal;
      font-weight: 300;
      src: url('${SSC300}') format('woff2');
    }
    
    @font-face {
      font-display: swap;
      font-family: 'Sofia Sans Condensed';
      font-style: normal;
      font-weight: 400;
      src: url('${SSC400}') format('woff2');
    }

    @font-face {
      font-display: swap;
      font-family: 'Sofia Sans Condensed';
      font-style: italic;
      font-weight: 200;
      src: url('${SSC200}') format('woff2');
    }

    @font-face {
      font-display: swap;
      font-family: 'DM Serif Display';
      font-style: normal;
      font-weight: 700;
      src: url('${DMSregular}') format('woff2');
    }

    @font-face {
      font-display: swap;
      font-family: 'DM Serif Display';
      font-style: italic;
      font-weight: 700;
      src: url('${DMSitalic}') format('woff2');
    }

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
      font-weight: 700;
      font-style: normal;
      line-height: .8;
      margin-bottom: 20px;
      margin-top: 0;
    }

    p{
      font-family: 'Sofia Sans Condensed', script;
      font-weight: 300;
      font-style: normal;
      margin: 0;
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
      width: 800px;
      justify-content: center;
      background-color: #2e2b2b;
      padding: 16px;
      box-sizing: border-box;
      border-radius: 50px;
    }

    .button {
      font-family: "Sofia Sans Condensed", sans-serif;
      font-weight: 400;
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
        background-color: #2e2b2b;
        box-sizing: border-box;
        padding: 4px 24px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    #colorMode{
      font-family: "Sofia Sans Condensed", sans-serif;
      font-size: 20px;
      font-weight: 200;
      font-style: italic;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 2px;
      text-decoration: none;
      cursor: pointer;
    }

    .icon{
        fill: #ffffff;
        transform: translateY(-1px) scale(1);
        width: 20px;
        margin-left: 5px;
    }

    .yellow{
        color: var(--yellow-text);
        background: linear-gradient(var(--yellow-highlight), var(--yellow-lowlight));
        box-shadow: inset 0 -.4rem var(--yellow-shadow);
    }

    .yellow:active{
        box-shadow: inset 0 .4rem var(--yellow-inset);
        transform: translateY(2px);
    }

    .blue{
        color: var(--blue-text);
        background: linear-gradient(var(--blue-highlight), var(--blue-lowlight));
        box-shadow: inset 0 -.4rem var(--blue-shadow);
    }

    .blue:active{
        box-shadow: inset 0 .4rem var(--blue-inset);
        transform: translateY(2px);
    }

    .green{
        color: var(--green-text);
        background: linear-gradient(var(--green-highlight), var(--green-lowlight));
        box-shadow: inset 0 -.4rem var(--green-shadow);
    }

    .green:active{
        box-shadow: inset 0 .4rem var(--green-inset);
        transform: translateY(2px);
    }

    .red{
        color: var(--red-text);
        background: linear-gradient(var(--red-highlight), var(--red-lowlight));
        box-shadow: inset 0 -.4rem var(--red-shadow);
    }

    .red:active{
        box-shadow: inset 0 .4rem var(--red-inset);
        transform: translateY(2px);
    }
  `;

  const overlay = document.createElement("div");
  overlay.id = "site-blocker-overlay";
  overlay.setAttribute("data-theme", "dark")
  overlay.innerHTML = `
    <section class="title">
      <h1><span id="timer-header">It's work time. </span><em id="block-timer">${formatTime(remainingTime)}</em><em> Left</em></h1>
      <p id="reason">This page is being blocked by Study Buddy because it's in the list of blocked sites</p>
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
  getTheme();
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
    let currentThemeSetting = overlayShadowRoot.querySelector("#site-blocker-overlay").getAttribute("data-theme");
    let newTheme = currentThemeSetting === "dark" ? "light" : "dark";

    if (newTheme == "dark") { changeToDark() }
    else { changeToLight() }

    overlayShadowRoot.querySelector("#site-blocker-overlay").setAttribute("data-theme", newTheme);
    chrome.runtime.sendMessage({
      action: "saveTheme",
      theme: newTheme
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
  getTheme();
  const timerData = request.timerData;
  const optionsData = request.optionsData;

  const timerEl = overlayShadowRoot.getElementById("block-timer");
  const timerh1 = overlayShadowRoot.getElementById("timer-header");
  const blockReason = overlayShadowRoot.getElementById("reason");

  chrome.storage.local.get(["colors"], (result) => {
    const stored = result.colors || {};
    const color1 = stored.color1 ?? "#edb110";
    const color2 = stored.color2 ?? "#2245d3";
    const color3 = stored.color3 ?? "#10cb00";
    const color4 = stored.color4 ?? "#d3191d";

    const style = document.createElement("style");
    style.textContent = generateStyleString({ color1, color2, color3, color4 });
    overlayShadowRoot.appendChild(style);
  });

  if (request.action == "updateUI") {
    chrome.runtime.sendMessage({ action: "getBlockedStatus", url: window.location.href }, (res) => {
      if (!res) return;
      if (!res.blocked) {
        removeOverlay();
        return;
      }
      else {
        timerEl.textContent = formatTime(timerData.remainingTime);
        if (timerData.paused) {
          timerh1.textContent = "Timer paused. "
        }
        else if (timerData.phase == "Work" && timerData.isRunning) {
          timerh1.textContent = "It's work time. "
          showOverlay();
        }
        if(optionsData.whitelist){
          blockReason.textContent = "This page is being blocked by Study Buddy because it's in the list of blocked sites";
        }
        else{
          blockReason.textContent = "This page is being blocked by Study Buddy because it's not in the list of allowed sites";
        }
      }
    });
  }
})

// notif when timers switch or end
function injectNotif() {
  if (document.getElementById("notif")) return;

  const host = document.createElement("div");
  host.id = "notif-shadow-root";
  host.style.position = "fixed";
  host.style.padding = "0";
  host.style.margin = "0";
  host.style.border = "0";

  host.style.zIndex = "999999"
  document.body.appendChild(host);

  notifShadowRoot = host.attachShadow({ mode: "open" });

  const SSC300 = chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-300.woff2');
  const SSC400 = chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-regular.woff2');
  const SSC200 = chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-200italic.woff2');
  const DMSregular = chrome.runtime.getURL('fonts/dm-serif-display-v15-latin-regular.woff2');
  const DMSitalic = chrome.runtime.getURL('fonts/dm-serif-display-v15-latin-italic.woff2');

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-display: swap;
      font-family: 'Sofia Sans Condensed';
      font-style: normal;
      font-weight: 300;
      src: url('${SSC300}') format('woff2');
    }
    
    @font-face {
      font-display: swap;
      font-family: 'Sofia Sans Condensed';
      font-style: normal;
      font-weight: 400;
      src: url('${SSC400}') format('woff2');
    }

    @font-face {
      font-display: swap;
      font-family: 'Sofia Sans Condensed';
      font-style: italic;
      font-weight: 200;
      src: url('${SSC200}') format('woff2');
    }

    @font-face {
      font-display: swap;
      font-family: 'DM Serif Display';
      font-style: normal;
      font-weight: 700;
      src: url('${DMSregular}') format('woff2');
    }

    @font-face {
      font-display: swap;
      font-family: 'DM Serif Display';
      font-style: italic;
      font-weight: 700;
      src: url('${DMSitalic}') format('woff2');
    }
      
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
      fill: white;
    }

    #timerLength{
      font-family: "DM Serif Display", serif;
      font-size: 48px;
      font-weight: 200;
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
      width: 40px;
    }

    .thumb-up{
      display: flex;
      justify-content: center;
      width: 100%;
      height: 40px;
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
    }`

  const notif = document.createElement("div");
  notif.id = "notif";
  notif.innerHTML = `    
    <button id="close-notif">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
    </button>
    <div id="content">
      <p id="popupText">The break is over. It's work time for the next</p>
      <div id="timerLength">
        <span id="tLength"></span>
        <svg class="icon thumb-up" id="thumb-up" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>
      </div>
    </div>`

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
  notifShadowRoot.getElementById("tLength").textContent = dur
  if (dur == "") {
    notifShadowRoot.getElementById("thumb-up").style.display = "flex"
  }
  else {
    notifShadowRoot.getElementById("thumb-up").style.display = "none"
  }
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
      removeOverlay();
      break;
    case "showOverlay":
      showOverlay();
      break;
    case "viewOnce":
      viewOnce();
      break;
    case "removeFromBlocked":
      chrome.runtime.sendMessage({ action: "toggleBlockSite", url: window.location.href });
      break;
    case "timerPhaseChanged":
      timerSwitchAlert(request.isRunning, request.newPhase, request.workDur, request.breakDur)
      break;
    case "updateTheme":
      if (request.theme == "dark") { changeToDark(); }
      else { changeToLight(); }
      break;
  }
});

function timerSwitchAlert(active, phase, workDur, breakDur) {
  if (!active) {
    showNotif("Focus session complete, well done!", "")
    removeOverlay();
  }
  else if (phase === "Work") {
    let time = formatTimeMinutes(workDur)
    if(time[0]){
      showNotif("The break is over. It's work time for the next", time[1] + "m")
    }
    else{
      showNotif("The break is over. It's work time for the next", time[1] + "s")
    }
    showOverlay();
  }
  else {
    let time = formatTimeMinutes(breakDur);
    if(time[0]){
      showNotif("Good work! It's break time for the next", time[1] + "m")
    }
    else{
      showNotif("Good work! It's break time for the next", time[1] + "s")
    }
    removeOverlay();
  }
}

async function preloadFonts() {
  // sofia sans normal 300
  const font1 = new FontFace(
    'Sofia Sans Condensed',
    `url(${chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-300.woff2')})`,
    { weight: '300', style: 'normal' }
  );

  const font5 = new FontFace(
    'Sofia Sans Condensed',
    `url(${chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-regular.woff2')})`,
    { weight: '400', style: 'normal' }
  );

  // sofia sans italic 200
  const font2 = new FontFace(
    'Sofia Sans Condensed',
    `url(${chrome.runtime.getURL('fonts/sofia-sans-condensed-v2-latin-200italic.woff2')})`,
    { weight: '200', style: 'italic' }
  );

  // dm serif display normal 400
  const font3 = new FontFace(
    'DM Serif Display',
    `url(${chrome.runtime.getURL('fonts/dm-serif-display-v15-latin-regular.woff2')})`,
    { weight: '700', style: 'normal' }
  );

  // dm serif display italic 400
  const font4 = new FontFace(
    'DM Serif Display',
    `url(${chrome.runtime.getURL('fonts/dm-serif-display-v15-latin-italic.woff2')})`,
    { weight: '700', style: 'italic' }
  );

  await Promise.all([font1.load(), font2.load(), font3.load(), font4.load(), font5.load()]);
  document.fonts.add(font1);
  document.fonts.add(font2);
  document.fonts.add(font3);
  document.fonts.add(font4);
  document.fonts.add(font5);
}

// get theme when the overlay first loads
function getTheme() {
  chrome.runtime.sendMessage({ action: "getTheme" }, (response) => {
    if (response == "dark") { changeToDark() }
    else { changeToLight() }
  });
}

// change colors to light mode colors and set theme to light
function changeToLight() {
  overlayShadowRoot.querySelector("#site-blocker-overlay").setAttribute("data-theme", "light");
  overlayShadowRoot.getElementById("colorMode").innerHTML = 'Switch to Dark Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>';
  // changing colors
  // page and section background color
  overlayShadowRoot.querySelector("#site-blocker-overlay").style.backgroundColor = "rgba(230, 230, 230, .99)"
  overlayShadowRoot.querySelector(".buttons").style.backgroundColor = "#f4f5f6"
  overlayShadowRoot.querySelector("footer").style.backgroundColor = "#f4f5f6"

  // text color
  overlayShadowRoot.querySelector(".title").style.color = "#000000"
  overlayShadowRoot.querySelector("#colorMode").style.color = "#000000"
  overlayShadowRoot.querySelector(".icon").style.fill = "#000000"

  // button colors
  // overlayShadowRoot.querySelector(".yellow").style.background = "linear-gradient( #F8C63F, #E4A238)";
  // overlayShadowRoot.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #CD9131";
  // overlayShadowRoot.querySelector(".yellow").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".yellow").style.boxShadow = "inset 0 6.4px #D8AB34" });
  // overlayShadowRoot.querySelector(".yellow").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #CD9131" });

  // overlayShadowRoot.querySelector(".blue").style.background = "linear-gradient( #3F64F8, #383BE4)";
  // overlayShadowRoot.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #3134CD";
  // overlayShadowRoot.querySelector(".blue").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".blue").style.boxShadow = "inset 0 6.4px #3455D8" });
  // overlayShadowRoot.querySelector(".blue").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #3134CD" });

  // overlayShadowRoot.querySelector(".green").style.background = "linear-gradient( #55D34A, #34A92E)";
  // overlayShadowRoot.querySelector(".green").style.boxShadow = "inset 0 -6.4px #32941E";
  // overlayShadowRoot.querySelector(".green").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".green").style.boxShadow = "inset 0 6.4px #3FC038" });
  // overlayShadowRoot.querySelector(".green").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".green").style.boxShadow = "inset 0 -6.4px  #32941E" });

  // overlayShadowRoot.querySelector(".red").style.background = "linear-gradient( #E24F52, #C52F2F)";
  // overlayShadowRoot.querySelector(".red").style.boxShadow = "inset 0 -6.4px #BA2222";
  // overlayShadowRoot.querySelector(".red").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".red").style.boxShadow = "inset 0 6.4px #D9393C" });
  // overlayShadowRoot.querySelector(".red").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".red").style.boxShadow = "inset 0 -6.4px #BA2222" });

  // notification
  notifShadowRoot.querySelector("#content").style.backgroundColor = "rgba(230, 230, 230, .99)";
  notifShadowRoot.querySelector("#content").style.boxShadow = "0 4px 0 0 #cbcbcb";
  notifShadowRoot.querySelector("#notif").style.color = "#000000";

  notifShadowRoot.querySelector("#notif").style.background = "linear-gradient( #55D34A, #34A92E)"
  notifShadowRoot.querySelector("#notif").style.boxShadow = "0 4px 0 0  #32941E";

  notifShadowRoot.querySelector("#timerLength").style.backgroundColor = "#e1e6dd";
  notifShadowRoot.querySelector(".thumb-up").style.fill = "#000000";
  notifShadowRoot.querySelector("#timerLength").style.boxShadow = "inset 0 0 5px 3px  #d4d8ce";
}

// change colors to dark mode colors and set theme to dark
function changeToDark() {
  overlayShadowRoot.querySelector("#site-blocker-overlay").setAttribute("data-theme", "dark");
  overlayShadowRoot.getElementById("colorMode").innerHTML = 'Switch to Light Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>';
  // changing colors
  // page and section background colors
  overlayShadowRoot.querySelector("#site-blocker-overlay").style.backgroundColor = "rgba(36, 35, 35, .99)"
  overlayShadowRoot.querySelector(".buttons").style.backgroundColor = "#2e2b2b"
  overlayShadowRoot.querySelector("footer").style.backgroundColor = "#2e2b2b";

  //text colors
  overlayShadowRoot.querySelector(".title").style.color = "#ffffff"
  overlayShadowRoot.querySelector("#colorMode").style.color = "#ffffff"

  // button colors
  // overlayShadowRoot.querySelector(".yellow").style.background = "linear-gradient( #edb110, #c78010)";
  // overlayShadowRoot.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #9b6a1b";
  // overlayShadowRoot.querySelector(".yellow").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".yellow").style.boxShadow = "inset 0 6.4px #c59000" });
  // overlayShadowRoot.querySelector(".yellow").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".yellow").style.boxShadow = "inset 0 -6.4px #9b6a1b" });

  // overlayShadowRoot.querySelector(".blue").style.background = "linear-gradient( #2245d3, #1417bb)";
  // overlayShadowRoot.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #0407a7";
  // overlayShadowRoot.querySelector(".blue").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".blue").style.boxShadow = "inset 0 6.4px #0e2fb1" });
  // overlayShadowRoot.querySelector(".blue").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".blue").style.boxShadow = "inset 0 -6.4px #0407a7" });

  // overlayShadowRoot.querySelector(".green").style.background = "linear-gradient( #10cb00, #078f00)";
  // overlayShadowRoot.querySelector(".green").style.boxShadow = "inset 0 -6.4px #1d740b";
  // overlayShadowRoot.querySelector(".green").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".green").style.boxShadow = "inset 0 6.4px #0ea506" });
  // overlayShadowRoot.querySelector(".green").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".green").style.boxShadow = "inset 0 -6.4px  #1d740b" });

  // overlayShadowRoot.querySelector(".red").style.background = "linear-gradient( #d3191d, #ab1b1b)";
  // overlayShadowRoot.querySelector(".red").style.boxShadow = "inset 0 -6.4px #890606";
  // overlayShadowRoot.querySelector(".red").addEventListener("mousedown", () => { overlayShadowRoot.querySelector(".red").style.boxShadow = "inset 0 6.4px #ab0a0d" });
  // overlayShadowRoot.querySelector(".red").addEventListener("mouseup", () => { overlayShadowRoot.querySelector(".red").style.boxShadow = "inset 0 -6.4px #890606" });

  // notification
  notifShadowRoot.querySelector("#content").style.backgroundColor = "rgba(36, 35, 35, .99)";
  notifShadowRoot.querySelector("#content").style.boxShadow = "0 4px 0 0 #181818";
  notifShadowRoot.querySelector("#notif").style.color = "#ffffff";

  notifShadowRoot.querySelector("#notif").style.background = "llinear-gradient( #10cb00, #078f00)"
  notifShadowRoot.querySelector("#notif").style.boxShadow = "0 4px 0 0 #1d740b";

  notifShadowRoot.querySelector("#timerLength").style.backgroundColor = "#54564f";
  notifShadowRoot.querySelector(".thumb-up").style.fill = "#ffffff";
  notifShadowRoot.querySelector("#timerLength").style.boxShadow = "inset 0 0 5px 3px  #3c3e38";
}

function generateStyleString({ color1, color2, color3, color4 }) {
  const y = generateShades(color1);
  const b = generateShades(color2);
  const g = generateShades(color3);
  const r = generateShades(color4);

  return `
      :host {
        --yellow-text: ${y.text};
        --yellow-highlight: ${y.highlight};
        --yellow-lowlight: ${y.lowlight};
        --yellow-shadow: ${y.shadow};
        --yellow-inset: ${y.inset};

        --blue-text: ${b.text};
        --blue-highlight: ${b.highlight};
        --blue-lowlight: ${b.lowlight};
        --blue-shadow: ${b.shadow};
        --blue-inset: ${b.inset};

        --green-text: ${g.text};
        --green-highlight: ${g.highlight};
        --green-lowlight: ${g.lowlight};
        --green-shadow: ${g.shadow};
        --green-inset: ${g.inset};

        --red-text: ${r.text};
        --red-highlight: ${r.highlight};
        --red-lowlight: ${r.lowlight};
        --red-shadow: ${r.shadow};
        --red-inset: ${r.inset};
      }
    `;
}

function generateShades(hex) {
  return {
    text: getTextColor(hex),
    highlight: hex,
    lowlight: darken(hex, 10),
    shadow: darken(hex, 20),
    inset: darken(hex, 15)
  };
}

function darken(hex, percent) {
  const amt = Math.round(2.55 * percent);
  const num = parseInt(hex.replace("#", ""), 16);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max(((num >> 8) & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function lighten(hex, percent) {
  const amt = Math.round(2.55 * percent);
  const num = parseInt(hex.replace("#", ""), 16);
  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min(((num >> 8) & 0x00FF) + amt, 255);
  const B = Math.min((num & 0x0000FF) + amt, 255);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function getTextColor(hex){
    //convert to rgb
    var r = parseInt(hex.substr(1,2), 16);
    var g = parseInt(hex.substr(3,2), 16);
    var b = parseInt(hex.substr(5,2), 16);

    //convert to hsl
    r /= 255;
    g /= 255; 
    b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    if(l > .8){
        return "#000000"
    }
    else{
        return "#ffffff"
    }
}