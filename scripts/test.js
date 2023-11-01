
document.getElementById('toggleBlocking').addEventListener('click', () => {
    console.log("check 1")
    chrome.runtime.sendMessage({ action: 'toggleBlocking' }, response => {
      if (response.enabled) {
        // Content blocking is enabled
        console.log("enabled");
      } else {
        // Content blocking is disabled
        console.log("disabled");
      }
    });
  });

