import { applyCustomColors } from "./shared.js";

// document elements
const automute = document.getElementById("automute");
const whitelist = document.getElementById("whitelist");
const timerOrderOptions = document.getElementsByName("timer-order");
const timerInputOptions = document.getElementsByName("timer-input");

const timerOrderopt1 = document.getElementById("work-break");
const timerOrderopt2 = document.getElementById("break-work");
const timerInputopt1 = document.getElementById("hr-min");
const timerInputopt2 = document.getElementById("min-sec");

const color1 = document.getElementById("color1");
const color2 = document.getElementById("color2");
const color3 = document.getElementById("color3");
const color4 = document.getElementById("color4");
const resetColors = document.getElementById("resetColors");

const save = document.getElementById("save");

//load settings when the page loads
document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ action: "getOptions" }, (response) => {
        automute.checked = response.automute;
        whitelist.checked = !response.whitelist;
        timerOrderOptions[0].checked = response.order;
        timerInputOptions[0].checked = !response.format;
    })

    if(timerOrderOptions[0].checked){
        timerOrderOptions[1].checked = true;
    }

    if(timerInputOptions[0].checked){
        timerInputOptions[1].checked = true;
    }

    chrome.storage.local.get(["colors"], (result) => {
        const storedColors = result.colors || {};
        color1.value = storedColors.color1 ?? "#edb110";
        color2.value = storedColors.color2 ?? "#2245d3";
        color3.value = storedColors.color3 ?? "#10cb00";
        color4.value = storedColors.color4 ?? "#d3191d";
        applyCustomColors({
            color1: storedColors.color1, 
            color2: storedColors.color2, 
            color3: storedColors.color3, 
            color4: storedColors.color4
        })
    })

    chrome.runtime.sendMessage({ action: "getTheme" }, (response) => {
        changeTheme(response);
    });
});

automute.addEventListener("change", saveOptions)
whitelist.addEventListener("change", saveOptions)
whitelist.addEventListener("change", saveOptions)

timerOrderopt1.addEventListener("change", saveOptions)
timerOrderopt2.addEventListener("change", saveOptions)
timerInputopt1.addEventListener("change", saveOptions)
timerInputopt2.addEventListener("change", saveOptions)

color1.addEventListener("change", saveColors)
color2.addEventListener("change", saveColors)
color3.addEventListener("change", saveColors)
color4.addEventListener("change", saveColors)

resetColors.addEventListener("click", () => {
    color1.value = "#edb110";
    color2.value = "#2245d3";
    color3.value = "#10cb00";
    color4.value = "#d3191d";
    saveColors();
})

save.addEventListener("click", () => {
    save.textContent = "Options Saved!"
    saveOptions();

    setTimeout(() => {
        save.textContent = "Save Options";
    }, 2000);
});

function saveOptions() {
    const settings = {
        automute: automute.checked,
        whitelist: !whitelist.checked,
        timerOrder: timerOrderOptions[0].checked,
        inputType: timerInputOptions[0].checked
    }

    chrome.storage.local.set(settings);
    saveColors();

    chrome.runtime.sendMessage({
        action: "updateOptions", data: {
            automute: settings.automute,
            whitelist: settings.whitelist,
            order: settings.timerOrder,
            format: !settings.inputType
        }
    })
}

function saveColors() {
    const colors = {
        color1: color1.value,
        color2: color2.value,
        color3: color3.value,
        color4: color4.value,
    }

    chrome.storage.local.set({ colors: colors });

    applyCustomColors({
        color1: colors.color1,
        color2: colors.color2,
        color3: colors.color3,
        color4: colors.color4
    });
}

// changing theme
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action =="updateTheme"){
      changeTheme(request.theme);
    }
});

colorMode.addEventListener("click", () => {
    let currentThemeSetting = document.querySelector("html").getAttribute("data-theme");
    let newTheme = currentThemeSetting === "dark" ? "light" : "dark";
    changeTheme(newTheme)

    document.querySelector("html").setAttribute("data-theme", newTheme);
    chrome.runtime.sendMessage({
        action: "saveTheme",
        theme: newTheme,
    });
});

function changeTheme(theme) {
    if (theme == "dark") {
        colorMode.innerHTML = 'Switch to Light Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>';
        document.querySelector("html").setAttribute("data-theme", "dark");
        document.querySelector(".logo").style.backgroundImage = 'url("../icons/sb-logo.svg")';
    }
    else {
        colorMode.innerHTML = 'Switch to Dark Mode <svg class="icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>';
        document.querySelector("html").setAttribute("data-theme", "light");
        document.querySelector(".logo").style.backgroundImage = 'url("../icons/sb-logo-dark.svg")';
    }
}