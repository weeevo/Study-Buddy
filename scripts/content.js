console.log("check 3");

function isHostnameAllowed() {
    // Implement logic to check if the current tab's hostname is allowed by the user
    // Return true if allowed, false otherwise
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
    return false;
  }
  
  function blockPageContent() {
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
    if (message.action === 'blockContent') {
      if (!isHostnameAllowed()) {
        blockPageContent();
      }
    }
  });