import os
import re
import threading
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.neural_network import MLPClassifier
from sklearn.exceptions import NotFittedError

# re → regular expressions (used for detecting URLs).
# TfidfVectorizer → converts text to numerical features using TF-IDF.
# make_pipeline → combines vectorizer + classifier in one object.


# ------------------ Config ------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = r"C:\Users\anagh\OneDrive\Desktop\abp\college\SEM 5\ai&nn\oratio\gamephisher\Datasets"
CSV_FILES = ["spam1.csv", "spam2.csv", "spam3.csv"]
SUSPICIOUS_KEYWORDS = ["click","here","free","win","urgent","prize","reward","verify","account","password","login","bank","update","confirm","activate","validate","bitcoin","money"]
URL_PATTERN = re.compile(r"https?://\S+|www\.\S+")

# ------------------ Globals ------------------
_model = _vectorizer = _label_encoder = None
_model_lock = threading.Lock()
KEYWORD_TOP_K = 5

# ------------------ Helpers ------------------
def extract_features(text):
    words = text.split()
    return {
        "keyword_count": sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in text.lower()),
        "has_url": int(bool(URL_PATTERN.search(text))),
        "exclamations": text.count("!"),
        "questions": text.count("?"),
        "all_caps_ratio": sum(1 for w in words if w.isupper()) / len(words) if words else 0,
        "length": len(text)
    }

    #Returns a dictionary of heuristic features

def load_datasets():
    dfs = []
    for file in CSV_FILES:
        path = os.path.join(DATASETS_DIR, file)
        if not os.path.isfile(path): continue
        df = pd.read_csv(path, usecols=["chat_message","category"]).dropna()
        df.columns = ["text","label"]
        df["label"] = df["label"].replace({"spam":"phishing","not_spam":"safe"})
        dfs.append(df)
    if not dfs: raise FileNotFoundError("No valid datasets found.")
    return pd.concat(dfs, ignore_index=True)

#Combines all datasets into one DataFrame. Raises error if no datasets are found.

# ------------------ Model ------------------
def train_model():
    global _model, _vectorizer, _label_encoder
    df = load_datasets()
    texts, labels = df["text"].tolist(), df["label"].tolist()

    le = LabelEncoder()
    y = le.fit_transform(labels)
    vec = TfidfVectorizer(ngram_range=(1,2), max_features=15000, stop_words="english")
    clf = MLPClassifier(hidden_layer_sizes=(128,64), activation='relu', solver='adam', max_iter=30, random_state=42, verbose=True)

    pipeline = make_pipeline(vec, clf)
    pipeline.fit(texts, y)

    _model, _vectorizer, _label_encoder = pipeline, vec, le
    print(f"[ML] Trained on {len(texts)} samples. Classes: {list(le.classes_)}")

def start_training_thread():
    threading.Thread(target=lambda: train_model(), daemon=True).start()

    # Starts model training in a separate thread to avoid blocking.

def extract_keywords(text, top_k=KEYWORD_TOP_K):
    if _vectorizer is None: return []
    X = _vectorizer.transform([text]).toarray()[0]
    feature_names = _vectorizer.get_feature_names_out()
    return [feature_names[i] for i in np.argsort(X)[::-1][:top_k] if X[i]>0]

# Returns top_k keywords from the text based on TF-IDF scores (only non zero ones)

# ------------------ Prediction ------------------
def predict(text):
    with _model_lock:
        if _model is None: raise NotFittedError("Model not ready.")
        #Ensures thread-safe prediction.
        # Raises error if model isn’t trained.

        proba = _model.predict_proba([text])[0]
        # produces a probablity array for classes ["safe", "phishing"]
        phishing_prob = float(proba[np.where(_label_encoder.classes_=="phishing")[0][0]])

        feats = extract_features(text)
        boost = 0.2*(feats["keyword_count"]>0) + 0.3*feats["has_url"] + 0.1*(feats["all_caps_ratio"]>0.5) + 0.1*((feats["exclamations"]>2) or (feats["questions"]>2))
        score = min(phishing_prob + boost, 1.0)
        label = "phishing" if score>=0.5 else "safe"

        return {
            "label": label,
            "score": round(score,4),
            "keywords": extract_keywords(text),
            "raw_prediction": f"phishing_prob={phishing_prob:.3f}",
            "heuristics": feats
        }
    
# Returns a dict with label, score, keywords, raw prediction and heuristic features.
# Boosts phishing probability based on heuristic features.
