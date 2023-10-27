let threshold = 0;
let highlightEnabled = false;
let highlightedElements = [];
let currentHighlightIndex = 0;

// Load settings from storage
chrome.storage.sync.get(["fandomCount", "highlightEnabled"], function (data) {
	threshold = data.fandomCount || 0; // default to zero
	highlightEnabled = data.highlightEnabled || false; // default to false (turn off feature by default)
	highlightFandoms(); // Start highlighting
});

// Listen for the message from popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action == "updatePage") {
		// To update based on submit on popup
		threshold = request.fandomCount || 0;
		highlightFandoms();
	} else if (request.action == "toggleHighlight") {
		// Update based on state of checkbox
		highlightEnabled = request.state;
		highlightFandoms();
	}
});

function highlightFandoms() {
	const listItems = document.querySelectorAll("li"); // Selecting all list item elements
	highlightedElements = []; // Clear array

	// Reset the background color for all items
	listItems.forEach((item) => {
		item.classList.remove("highlighted-item", "current-highlight"); // Clear any previous highlight
		item.classList.remove("current-highlight");
	});

	// If the toggle is off, exit the function early
	if (!highlightEnabled) {
		removeNavigationButtons(); // Hide navigation buttons when feature is off
		return;
	}

	// Now, apply the highlight based on the current threshold
	listItems.forEach((item) => {
		const text = item.innerText || item.textContent; // Test each list item text
		const match = text.match(/\((\d+)\)(?!.*\(\d+\))/); // Count the work number based on regex
		if (match && parseInt(match[1]) >= threshold) {
			item.classList.add("highlighted-item"); // Highlight fandom it it meets the minimum amount
			highlightedElements.push(item); // Add to array for navigation
		}
	});
	console.log("Changes applied based on settings!"); // Debug message
	createNavigationButtons(); // Create button after all items are highlighted
}

function createNavigationButtons() {
	// Check if buttons already exist
	if (document.getElementById("nextHighlight")) return;

	// Styling the next button
	const nextButton = document.createElement("button");
	nextButton.innerHTML = "Next Fandom";
	nextButton.id = "nextHighlight";
	nextButton.style.position = "fixed";
	nextButton.style.bottom = "10px";
	nextButton.style.right = "10px";
	nextButton.style.zIndex = "1000"; // Ensure it's above other page elements
	nextButton.addEventListener("click", function () {
		goToHighlight(1);
	});

	// Styling the previous button
	const prevButton = document.createElement("button");
	prevButton.innerHTML = "Previous Fandom";
	prevButton.id = "prevHighlight";
	prevButton.style.position = "fixed";
	prevButton.style.bottom = "40px"; // A bit above the next button
	prevButton.style.right = "10px";
	prevButton.style.zIndex = "1000"; // Ensure it's above other page elements
	prevButton.addEventListener("click", function () {
		goToHighlight(-1);
	});

	// Placing the button on screen
	document.body.appendChild(nextButton);
	document.body.appendChild(prevButton);
}

function goToHighlight(direction) {
	// Remove current highlight from previously highlighted item
	if (highlightedElements[currentHighlightIndex]) {
		highlightedElements[currentHighlightIndex].classList.remove(
			"current-highlight"
		);
	}

	// Increment or decrement the index
	currentHighlightIndex += direction;

	// Handle edge cases
	if (currentHighlightIndex >= highlightedElements.length)
		currentHighlightIndex = 0;
	if (currentHighlightIndex < 0)
		currentHighlightIndex = highlightedElements.length - 1;

	// Add the 'highlighted-item' class if it's not there and then add the 'current-highlight' class
	highlightedElements[currentHighlightIndex].classList.add(
		"highlighted-item",
		"current-highlight"
	);

	// Snap browser display to the element
	highlightedElements[currentHighlightIndex].scrollIntoView({
		behavior: "smooth",
		block: "center",
	});
}

// Removing the button when feature is turned off
function removeNavigationButtons() {
	const nextButton = document.getElementById("nextHighlight");
	const prevButton = document.getElementById("prevHighlight");

	if (nextButton) nextButton.remove();
	if (prevButton) prevButton.remove();
}
