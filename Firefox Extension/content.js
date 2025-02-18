chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "getReviews") {
        let reviews = [];
        document.querySelectorAll("span[data-hook='review-body']").forEach(el => {
            reviews.push(el.innerText.trim());
        });

        sendResponse({ reviews: reviews.length ? reviews : [] });
    }
});
