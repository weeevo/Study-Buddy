chrome.webNavigation.onCompleted.addListener(function(details) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        const stringToMatch = 'google.com'; // Replace with the string you want to check
        
        if (tab && tab.url) {
            if (!tab.url.startsWith('chrome-extension://') && tab.url.includes(stringToMatch)) {
                chrome.tabs.executeScript(tab.id, { file: "scripts/content.js" });
            }
        }
    });
});