const isBlockingKey = "blocking_state";

document.addEventListener("DOMContentLoaded", function () {

    //get the blocking enabled / disabled status
    var isBlocking = false;

    chrome.storage.local.get([isBlockingKey]).then((result) => {
        if(typeof result.key === 'undefined') {
            console.log('Key Value is undefined.');

            chrome.storage.local.set({ isBlockingKey: isBlocking }).then(() => {
                console.log("Value is set");
            });

            console.log("Stored Value is " + isBlocking);
        } else {
            console.log("Value currently is " + result.key);
        }
        
    });


    if (isBlocking) {
        document.getElementById('block_status').textContent = "ENABLED";
    } else {
        document.getElementById('block_status').textContent = "DISABLED";
    }
    




    document.getElementById('toggleBlocking').addEventListener('click', () => {
        
        if (isBlocking) {
            isBlocking = false;
        } else {
            isBlocking = true;
        }

        if (isBlocking) {
            document.getElementById('block_status').textContent = "ENABLED";
        } else {
            document.getElementById('block_status').textContent = "DISABLED";
        }

        chrome.storage.local.set({ isBlockingKey: isBlocking }).then(() => {
            console.log("New Value is set");
        });
        
        
        //console.log("Button clicked to toggle content blocking");
        // chrome.runtime.sendMessage({ action: 'toggleBlocking' }, response => {
        //   if (response.enabled) {
        //     console.log("Content blocking is enabled");
        //   } else {
        //     console.log("Content blocking is disabled");
        //   }
        // });

        chrome.runtime.sendMessage({action: "toggleBlocking", state: "enabled" },
        function (response) {
            enabled_status = response.enabled;
            console.log("Background blocking status: " + enabled_status);
        });


      });   
});

