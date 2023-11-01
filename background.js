// chrome.webNavigation.onCompleted.addListener(function(details) {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         const tab = tabs[0];
//         const stringToMatch = 'google.com'; // Replace with the string you want to check
        
//         if (tab && tab.url) {
//             if (!tab.url.startsWith('chrome-extension://') && tab.url.includes(stringToMatch)) {
//                 chrome.tabs.executeScript(tab.id, { file: "scripts/content.js" });
//             }
//         }
//     });
// });

let contentBlockingEnabled = false;
console.log("check 2");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleBlocking') {
    contentBlockingEnabled = !contentBlockingEnabled;
    sendResponse({ enabled: contentBlockingEnabled });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (contentBlockingEnabled && changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: () => {
        chrome.runtime.sendMessage({ action: 'blockContent' });
      }
    });
  }
});