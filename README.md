# PhishBait: AI-Based In-Game Chat Phishing Detection

## Project Details
* [cite_start]**Title:** PhishBait [cite: 1] - [cite_start]AI-Based In-Game Chat Phishing Detection [cite: 2]
* [cite_start]**Course:** AI&NN - 20CYS304 Mini Project [cite: 3]
* **Team Members:**
    * [cite_start]Anagha B Prashanth - CB.SC.U4CYS23002 [cite: 4]
    * [cite_start]Devinandha - CB.SC.U4CYS23011 [cite: 4]
    * [cite_start]Ishitha Praveen - CB.SC.U4CYS23018 [cite: 4]

---

## AIM
[cite_start]The aim is to design and develop an **AI-based, real-time phishing detection system** for in-game chat environments[cite: 6]. [cite_start]This system will automatically identify phishing or scam messages and notify users through a browser extension[cite: 6]. [cite_start]The browser extension will send chat messages to a locally hosted **Flask service** that runs the machine-learning model and returns classification results[cite: 6].

---

## PROBLEM STATEMENT
[cite_start]Online multiplayer games frequently use open chat systems for free player communication[cite: 8]. [cite_start]However, attackers increasingly exploit these environments by sending phishing messages, scam links, or fake promotions to trick users into revealing personal information or visiting malicious sites[cite: 9].

Therefore, there is a need for a **real-time detection system** that can:
* [cite_start]Monitor in-game chats locally[cite: 10].
* [cite_start]Detect phishing or scam messages instantly[cite: 10].
* [cite_start]Alert users without interrupting gameplay[cite: 10].

---

## CURRENT CHALLENGES
* [cite_start]The online multiplayer game community is growing[cite: 56].
* [cite_start]Players are easily tricked by fake offers or links[cite: 57].
* [cite_start]Traditional filters often fail because of the informal language used in game chat[cite: 58, 59].

---

## PROPOSED SYSTEM
The proposed system works in a multi-step process:

1.  [cite_start]**In-Game Chat Capture:** A browser extension captures live messages from the game chat, monitoring all incoming and outgoing text in real-time[cite: 62].
2.  [cite_start]**Pre-processing Module:** This module extracts the message text and prepares it for feature extraction, ensuring it's in a format suitable for analysis[cite: 64].
3.  [cite_start]**Feature Extraction (TF-IDF Vectorization):** The extracted text is converted into numerical vectors using **TF-IDF** (Term Frequency-Inverse Document Frequency), which helps highlight suspicious terms like "link," "free," or "click"[cite: 66].
4.  [cite_start]**Classification Model:** The feature vectors are analyzed by a **Multi-layer Perceptron (MLP) model**, which classifies each message as **phishing** or **safe**[cite: 69]. [cite_start]The model also provides a probability score that indicates the detection confidence[cite: 69]. [cite_start]Additional parameters are included to get better game-specific results[cite: 70].
5.  [cite_start]**Alert System:** The classification results are sent back to the browser extension[cite: 72]. [cite_start]The extension displays **visual alerts** in the form of colored badges next to all messages to inform players in real-time[cite: 72].

---

## DATASETS USED
[cite_start]To train and evaluate the AI model, three datasets were used for phishing and scam message detection in in-game chat messages[cite: 74]:
* [cite_start]Two publicly available SMS phishing datasets[cite: 74]:
    * [cite_start]SMS Phishing Dataset for Machine Learning and Pattern Recognition [cite: 75]
    * [cite_start]Kaggle SMS Spam Collection (Text Classification) [cite: 76]
* [cite_start]One custom-generated dataset tailored for game environments[cite: 74, 77].

---

## ARCHITECTURE OVERVIEW

### Browser Extension
* [cite_start]Injected into game pages using `manifest.json` and `content.js`[cite: 80].
* [cite_start]Observes the chat **DOM** (Document Object Model) and extracts new messages[cite: 81].
* [cite_start]Sends messages to the local Flask server at `http://127.0.0.1:5000/detect`[cite: 82].

### Flask Server (`chat_server.py`)
* [cite_start]Exposes `/detect` (POST) and `/status` (GET) endpoints[cite: 84].
* [cite_start]A background thread trains the ML model on startup[cite: 85].

### Phishing Detector (`phishing_detector.py`)
* [cite_start]Uses a **TF-IDF + MLP pipeline**[cite: 87].
* [cite_start]Combines the ML prediction with **heuristics** (keywords, URLs, punctuation, all-caps)[cite: 88].
* [cite_start]Returns a JSON object: `{label, score, heuristics, keywords}`[cite: 88].

### Extension UI
* [cite_start]Displays a transient **badge** next to the chat message (~12s) showing the label and score[cite: 90].

---

## FILE ROLES

| File Name | Role |
| :--- | :--- |
| **Manifest.json** | [cite_start]Declares MV3 extension, permissions, and injects `content.js`[cite: 91]. |
| **content.js** | [cite_start]Monitors chat, sends messages to the server, and shows badges[cite: 91]. |
| **chat\_server.py** | [cite_start]Flask app, handles `/detect` and `/status` endpoints, and starts the training thread[cite: 91]. |
| **phishing\_detector.py** | [cite_start]Loads datasets, trains the model, and computes predictions[cite: 91]. |

---

## PhishBait - Request/Response Flow
1.  [cite_start]User opens chat $\rightarrow$ `content.js` observes new messages[cite: 94].
2.  [cite_start]`content.js` sends the message to the Flask server's `/detect` endpoint via `fetch`[cite: 95].
3.  [cite_start]The server calls `predict(text)` $\rightarrow$ which uses the ML model and heuristics $\rightarrow$ and returns a JSON result[cite: 96].
4.  [cite_start]The extension parses the response $\rightarrow$ and shows a badge beside the message[cite: 97].

---

## RESULTS

### System Performance
* [cite_start]The system successfully classifies game chats as **phishing or safe in real-time**[cite: 99].
* [cite_start]It provides the **probability scores** with confidence levels and uses **coloured badges** near messages for warnings or safe indicators[cite: 99].
* [cite_start]The system can handle **multiple simultaneous chat streams without lag**[cite: 99].

### Detected Phishing Messages
[cite_start]Most detected phishing messages involved[cite: 100]:
1.  [cite_start]Promises of in-game rewards[cite: 100].
2.  [cite_start]Suspicious URLs and link-related content[cite: 100].
3.  [cite_start]Requests for personal info/related texts[cite: 100].

---

## DRAWBACKS
* [cite_start]**Language:** The model's accuracy needs improvement for slang, abbreviations, or non-English messages[cite: 101].
* [cite_start]**Limited Dataset Coverage:** The training data may not represent all in-game chat styles or emerging phishing patterns[cite: 102].
* [cite_start]**Keyword Sensitivity:** Over-reliance on specific keywords can lead to false positives or cause the system to miss context-based phishing attempts[cite: 103].

---

## CONCLUSION
[cite_start]**PhishBait** provides an effective, real-time safeguard against phishing and scams in live game chats[cite: 104]. [cite_start]It achieves this by integrating a lightweight **browser extension**, a local **Flask gateway**, and a **Multi-layer Perceptron (MLP)**[cite: 104].

[cite_start]Starting from a keyword and **TF-IDF baseline** with active learning improvements, it delivers fast, accurate detection while maintaining user-friendly performance[cite: 105]. [cite_start]PhishBait empowers players to enjoy games confidently and responsibly by preventing malicious interactions and securing accounts[cite: 106].

---

## FUTURE SCOPE
* [cite_start]Improve dataset and labeling[cite: 107].
* [cite_start]Focus on explainability and human-in-the-loop validation[cite: 107].
* [cite_start]Develop contextual and user-aware detection[cite: 107].
