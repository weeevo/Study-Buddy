var internal_blocking_state = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleBlocking') {
      console.log('Received message to toggle content blocking');
      console.log('Received state: ' + message.state);
      if (message.state === 'enabled') {
        internal_blocking_state = true;
      } else {
        internal_blocking_state = false;
      }
      
      
      sendResponse({ enabled: internal_blocking_state }); // Change the response based on your logic
    }



});
  

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
  }
  



chrome.tabs.onActivated.addListener((tabId, changeInfo, tab) => {
    console.log('Tab updated:', tabId);
    var tab_id;
    
    function blockPageContent() {
        //console.log("starting to block");
        // Inject a div element with a black background over the entire page
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'black';
        overlay.style.zIndex = '9999';
        document.body.appendChild(overlay);
      }


    (async () => {
        tab_id = await getCurrentTab();
        console.log(tab_id)

        chrome.scripting.executeScript({
            target: { tabId: tab_id },
            function: () => {
            //document.body.style.backgroundColor = "red";
            //chrome.runtime.sendMessage({ action: 'blockContent' });
           const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'black';
        overlay.style.zIndex = '9999';
        document.body.appendChild(overlay);
            }
            
        });


     })()

    
    
    
    
    // chrome.scripting.executeScript({
    //   target: { tabId: tabId },
    //   function: () => {
    //     chrome.runtime.sendMessage({ action: 'blockContent' });
    //   }
    // });


    // chrome.tabs.query({
    //     active: true,
    //     lastFocusedWindow: true
    // }, function(tabs) {
    //     // and use that tab to fill in out title and url
    //     var tab = tabs[0];
    //     console.log(tab.url);
       

        


    // });


  });