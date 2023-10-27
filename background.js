chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ["content.js"],
	});
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
	if (
		changeInfo.url &&
		changeInfo.url.startsWith("https://archiveofourown.org/media/")
	) {
		// Reset the highlightEnabled value to false every time a relevant page loads/refreshes
		chrome.storage.sync.set({ highlightEnabled: false });
	}
});
