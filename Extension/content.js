// content.js
(function() {
  const SERVER_URL = "http://127.0.0.1:5000/detect";

  // ------------------ Helper: send message to server ------------------

  async function sendToServer(text) {
    try {
      const resp = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  }

  //sends a POST request to the Flask server.
  // If the server responds with a status code indicating success (2xx)
  // it parses and returns the JSON response.
  // If there's an error (network issue, non-2xx status), it returns null.

  // ------------------ Helper: display phishing badge ------------------
  function showBadge(targetSpan, result) {
    //it takes input the DOM element and result of testing
    if (!targetSpan || !result) return;
    //this ensures that the DOM element and result exists
    if (targetSpan.dataset.phishChecked) return;
    // avoid duplicates - so that our badge isnt added multiple times
    targetSpan.dataset.phishChecked = "true";
    //marks the message as checked

    const badge = document.createElement("span");
    badge.className = "phish-badge";
    badge.textContent = result.label ? `${result.label} (${Math.round(result.score * 100)}%)` : "unknown";
    badge.style.marginLeft = "8px";
    badge.style.padding = "2px 6px";
    badge.style.borderRadius = "6px";
    badge.style.fontSize = "11px";
    badge.style.fontWeight = "600";
    badge.style.verticalAlign = "middle";
    //this creates a span element that will display the badge

    if (result.label === "phishing") {
      badge.style.background = "rgba(255, 0, 0, 0.12)";
      badge.style.color = "#7a0303";
    } else {
      badge.style.background = "rgba(0, 128, 0, 0.08)";
      badge.style.color = "#083b09";
    }

    targetSpan.appendChild(badge);
    setTimeout(() => badge.remove(), 12000);
  }


// ------------------ Hangman Handling (Dynamic) ------------------
const hangmanSeen = new Set();
//creates a js set that stores all messages that have already been checked.
const hangmanContainerSelector = "#chatBox";
//css selector for it

async function handleHangmanSpan(span) {
    const text = span.innerText?.trim();
    if (!text || hangmanSeen.has(text)) return;
    hangmanSeen.add(text);

    //skips past messages it has already seen

    const result = await sendToServer(text);
    //Sends the message text to the Flask server for phishing detection.
    if (result) showBadge(span, result);
}

function scanHangmanExisting() {
    const spans = document.querySelectorAll("#chatBox > p");
    spans.forEach(handleHangmanSpan);
}

//This handles chat messages that already exist when the page loads.

function setupHangmanObserver() {
    const container = document.querySelector(hangmanContainerSelector);
    if (!container) return;

    //Selects the chat container using the selector #chatBox

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches("p")) handleHangmanSpan(node);
            });
        });
    });

    //MutationObserver watches for DOM changes inside the chat container.


    observer.observe(container, { childList: true, subtree: true });
    scanHangmanExisting();
    console.log("Hangman observer set up.");

    //childList: true → watch for added or removed direct children.
    // subtree: true → also watch all descendants (nested elements).
    // This ensures all new chat messages are detected, even if nested.
}

  // ------------------ Skribbl.io Handling ------------------
  const skribblSeen = new Set();
  //Keeps track of already processed messages in Skribbl.io chat.

  const chatSelector = "#game-chat > div.chat-content > p > span";
  const chatContainerSelector = "#game-chat > div.chat-content";


  async function handleSkribblSpan(span) {
    const text = span.innerText?.trim();
    //gets the text from the message span

    if (!text || skribblSeen.has(text)) return;
    skribblSeen.add(text);
    //skip if no text or already seen

    const message = text.includes(":") ? text.split(":", 2)[1].trim() : text;
    //Extracts the actual message content, removing usernames if present.
    const result = await sendToServer(message);
    //Sends the message to the Flask server for phishing detection.
    if (result) showBadge(span, result);
  }

  function scanSkribblExisting() {
    document.querySelectorAll(chatSelector).forEach(handleSkribblSpan);
  }

  //Handles chat messages that already exist when the page loads.

  function setupSkribblObserver() {
    const container = document.querySelector(chatContainerSelector);
    if (!container) return;

    //Selects the chat container using the selector #game-chat > div.chat-content

    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;

          const span = node.matches("p > span") ? node : node.querySelector("span");
          if (span) handleSkribblSpan(span);
        });
      });
    });

    //MutationObserver watches for DOM changes inside the chat container.
    // It looks for newly added <p><span> elements which contain chat messages.

    observer.observe(container, { childList: true, subtree: true });
    scanSkribblExisting();

    //childList: true → watch for added or removed direct children.
    // subtree: true → also watch all descendants (nested elements).
    // This ensures all new chat messages are detected, even if nested.
  }

  // ------------------ Wait for containers and initialize ------------------
  const maxRetries = 20;
  let tries = 0;
  const interval = setInterval(() => {
    const hangmanReady = document.querySelector(hangmanContainerSelector);
    const skribblReady = document.querySelector(chatContainerSelector);

    //Check if the chat containers for Hangman or Skribbl.io are present in the DOM.

    if (hangmanReady) setupHangmanObserver();
    if (skribblReady) setupSkribblObserver();

    // If found, set up the respective MutationObserver to monitor chat messages.

    if (hangmanReady || skribblReady) clearInterval(interval);
    // Stop checking once we've initialized for either game.

    tries += 1;
    if (tries >= maxRetries) clearInterval(interval);
  }, 500);

  //Retries every 500ms, up to 20 times (10 seconds total), to find the chat containers.
  // This handles cases where the game content loads asynchronously after the initial page load.
})();
