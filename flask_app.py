# chat_server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from phish_detector import predict, start_training_thread, _model
from sklearn.exceptions import NotFittedError

HOST = "127.0.0.1"
PORT = 5000

app = Flask(__name__)
CORS(app)

@app.route("/detect", methods=["POST"])

#This route listens for POST requests at /detect.
# It will receive a JSON containing a chat message.

def detect():
    """Receive chat message and return phishing/safe classification."""
    payload = request.get_json(force=True, silent=True)
    if not payload:
        return jsonify({"error": "Invalid JSON"}), 400

    text = payload.get("text", "").strip()
    if not text:
        return jsonify({"error": "Empty text"}), 400
    #Extracts the text field from JSON. Returns 400 if the text is empty.

    try:
        result = predict(text)
        return jsonify(result)
    #Calls predict from phish_detector to classify the message.
    # Returns the result as JSON.
    except NotFittedError:
        return jsonify({"error": "Model not trained yet"}), 503
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/status", methods=["GET"])
def status():
    """Return whether model is ready."""
    ready = _model is not None
    return jsonify({"ready": ready})

#Simple GET request to check if the model has finished training.

if __name__ == "__main__":
    start_training_thread()
    print(f"[SERVER] Flask app running on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=False)

    #When run as main script: Starts model training in a background thread. Prints server info.
