chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleBlocking') {
      console.log('Received message to toggle content blocking');
      sendResponse({ enabled: true }); // Change the response based on your logic
    }
  });
  
  chrome.tabs.onActivated.addListener((tabId, changeInfo, tab) => {
    console.log('Tab updated:', tabId);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        chrome.runtime.sendMessage({ action: 'blockContent' });
      }
    });


    // chrome.tabs.query({
    //     active: true,
    //     lastFocusedWindow: true
    // }, function(tabs) {
    //     // and use that tab to fill in out title and url
    //     var tab = tabs[0];
    //     console.log(tab.url);
    //     // alert(tab.url);

    //     chrome.scripting.executeScript({
    //         target: { tabId: tab.id },
    //         function: () => {
    //         chrome.runtime.sendMessage({ action: 'blockContent' });
    //         }
    //     });


    });


//   });