alert("hello");
function isHostnameAllowed() {
    // Implement logic to check if the current tab's hostname is allowed by the user
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
  
    // For testing purposes, always return false
    const isAllowed = false; // Change this to your actual logic
    console.log('Is allowed:', isAllowed);
  
    return isAllowed;
  }
  
  function blockPageContent() {
    console.log("starting to block");
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
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    alert("test");
    if (message.action === 'blockContent') {
        console.log('Received message to block content');
        if (!isHostnameAllowed()) {
        blockPageContent();
      }
    }
  });

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     func: () => {
//       // write your code here
//       document.body.style.backgroundColor = "red";
//     },
//   });