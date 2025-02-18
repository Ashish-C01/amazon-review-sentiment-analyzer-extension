chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getReviews") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return;
            chrome.tabs.sendMessage(tabs[0].id, { action: "getReviews" }, (response) => {
                sendResponse(response);
            });
        });
    }
    return true;
});
