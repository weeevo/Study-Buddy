
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('toggleBlocking').addEventListener('click', () => {
        //console.log("Button clicked to toggle content blocking");
        // chrome.runtime.sendMessage({ action: 'toggleBlocking' }, response => {
        //   if (response.enabled) {
        //     console.log("Content blocking is enabled");
        //   } else {
        //     console.log("Content blocking is disabled");
        //   }
        // });

        chrome.runtime.sendMessage({action: "toggleBlocking"},
        function (response) {
            enabled_status = response.enabled;
            console.log("Content blocking status: " + enabled_status);
        });


      });   
});

