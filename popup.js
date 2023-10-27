document.getElementById("submit").addEventListener("click", function () {
	const count = document.getElementById("countInput").value;

	// Validate the input to be greater or equal to 0 or  not null
	if (isNaN(count) || count < 0) {
		alert("Please enter a valid number greater than or equal to 0."); // Error message
		return; // Do not proceed
	}

	chrome.storage.sync.set({ fandomCount: count }, function () {
		// Debugging Message to Verify
		// alert("Value is set to " + count);
		console.log("Set to value: " + count);
	});

	// Send a message to the content script to update the page with the new value
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			action: "updatePage",
			fandomCount: count,
		});
	});
});

// Load the saved toggle state when the popup is opened
document.addEventListener("DOMContentLoaded", function () {
	chrome.storage.sync.get("highlightEnabled", function (data) {
		document.getElementById("toggleCheckbox").checked =
			data.highlightEnabled || false;
	});
});

document
	.getElementById("toggleCheckbox")
	.addEventListener("change", function () {
		const isChecked = document.getElementById("toggleCheckbox").checked;

		chrome.storage.sync.set({ highlightEnabled: isChecked }, function () {
			// Send a message to the content script to update the page with the new toggle state
			chrome.tabs.query(
				{ active: true, currentWindow: true },
				function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {
						action: "toggleHighlight",
						state: isChecked,
					});
				}
			);
		});
	});
