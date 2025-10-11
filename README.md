# PhishBait: AI-Based In-Game Chat Phishing Detection

## Project Details

* **Title:** PhishBait  - AI-Based In-Game Chat Phishing Detection
* **Course:** AI&NN - 20CYS304 Mini Project
* **Team Members:**

  * Anagha B Prashanth - CB.SC.U4CYS23002 [@4n4gh4](https://github.com/4n4gh4)
  * Devinandha - CB.SC.U4CYS23011 [@ishitha05praveen](https://github.com/ishitha05praveen)
  * Ishitha Praveen - CB.SC.U4CYS23018 [@devinandha1222](https://github.com/devinandha1222)

---

## AIM

The aim is to design and develop an **AI-based, real-time phishing detection system** for in-game chat environments. This system will automatically identify phishing or scam messages and notify users through a browser extension. The browser extension will send chat messages to a locally hosted **Flask service** that runs the machine-learning model and returns classification results.

---

## PROBLEM STATEMENT

Online multiplayer games frequently use open chat systems for free player communication. However, attackers increasingly exploit these environments by sending phishing messages, scam links, or fake promotions to trick users into revealing personal information or visiting malicious sites.

Therefore, there is a need for a **real-time detection system** that can:

* Monitor in-game chats locally.
* Detect phishing or scam messages instantly.
* Alert users without interrupting gameplay.

---

## CURRENT CHALLENGES

* The online multiplayer game community is growing.
* Players are easily tricked by fake offers or links.
* Traditional filters often fail because of the informal language used in game chat.

---

## PROPOSED SYSTEM

The proposed system works in a multi-step process:

1. **In-Game Chat Capture:** A browser extension captures live messages from the game chat, monitoring all incoming and outgoing text in real-time.
2. **Pre-processing Module:** This module extracts the message text and prepares it for feature extraction, ensuring it's in a format suitable for analysis.
3. **Feature Extraction (TF-IDF Vectorization):** The extracted text is converted into numerical vectors using **TF-IDF** (Term Frequency-Inverse Document Frequency), which helps highlight suspicious terms like "link," "free," or "click".
4. **Classification Model:** The feature vectors are analyzed by a **Multi-layer Perceptron (MLP) model**, which classifies each message as **phishing** or **safe**. The model also provides a probability score that indicates the detection confidence. Additional parameters are included to get better game-specific results.
5. **Alert System:** The classification results are sent back to the browser extension. The extension displays **visual alerts** in the form of colored badges next to all messages to inform players in real-time.

---

## DATASETS USED

To train and evaluate the AI model, three datasets were used for phishing and scam message detection in in-game chat messages:

* Two publicly available SMS phishing datasets:

  * SMS Phishing Dataset for Machine Learning and Pattern Recognition
  * Kaggle SMS Spam Collection (Text Classification)
* One custom-generated dataset tailored for game environments.

---

## ARCHITECTURE OVERVIEW

### Browser Extension

* Injected into game pages using `manifest.json` and `content.js`.
* Observes the chat **DOM** (Document Object Model) and extracts new messages.
* Sends messages to the local Flask server at `http://127.0.0.1:5000/detect`.

### Flask Server (`chat_server.py`)

* Exposes `/detect` (POST) and `/status` (GET) endpoints.
* A background thread trains the ML model on startup.

### Phishing Detector (`phishing_detector.py`)

* Uses a **TF-IDF + MLP pipeline**.
* Combines the ML prediction with **heuristics** (keywords, URLs, punctuation, all-caps).
* Returns a JSON object: `{label, score, heuristics, keywords}`.

### Extension UI

* Displays a transient **badge** next to the chat message (~12s) showing the label and score.

---

## FILE ROLES

| File Name                | Role                                                                                  |
| :----------------------- | :------------------------------------------------------------------------------------ |
| **Manifest.json**        | Declares MV3 extension, permissions, and injects `content.js`.                        |
| **content.js**           | Monitors chat, sends messages to the server, and shows badges.                        |
| **chat_server.py**       | Flask app, handles `/detect` and `/status` endpoints, and starts the training thread. |
| **phishing_detector.py** | Loads datasets, trains the model, and computes predictions.                           |

---

## PhishBait - Request/Response Flow

1. User opens chat → `content.js` observes new messages.
2. `content.js` sends the message to the Flask server's `/detect` endpoint via `fetch`.
3. The server calls `predict(text)` → which uses the ML model and heuristics → and returns a JSON result.
4. The extension parses the response → and shows a badge beside the message.

---

## RESULTS

### System Performance

* The system successfully classifies game chats as **phishing or safe in real-time**.
* It provides the **probability scores** with confidence levels and uses **coloured badges** near messages for warnings or safe indicators.
* The system can handle **multiple simultaneous chat streams without lag**.

### Detected Phishing Messages

Most detected phishing messages involved:

1. Promises of in-game rewards.
2. Suspicious URLs and link-related content.
3. Requests for personal info/related texts.

---

## DRAWBACKS

* **Language:** The model's accuracy needs improvement for slang, abbreviations, or non-English messages.
* **Limited Dataset Coverage:** The training data may not represent all in-game chat styles or emerging phishing patterns.
* **Keyword Sensitivity:** Over-reliance on specific keywords can lead to false positives or cause the system to miss context-based phishing attempts.

---

## CONCLUSION

**PhishBait** provides an effective, real-time safeguard against phishing and scams in live game chats. It achieves this by integrating a lightweight **browser extension**, a local **Flask gateway**, and a **Multi-layer Perceptron (MLP)**.

Starting from a keyword and **TF-IDF baseline** with active learning improvements, it delivers fast, accurate detection while maintaining user-friendly performance. PhishBait empowers players to enjoy games confidently and responsibly by preventing malicious interactions and securing accounts.

---

## FUTURE SCOPE

* Improve dataset and labeling.
* Focus on explainability and human-in-the-loop validation.
* Develop contextual and user-aware detection.
