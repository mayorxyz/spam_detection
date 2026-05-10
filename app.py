from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import time
import sqlite3
import uuid
import os
from preprocess import preprocess

app = Flask(__name__)
CORS(app)

tfidf = joblib.load('models/tfidf.pkl')
nb    = joblib.load('models/nb.pkl')
svm   = joblib.load('models/svm.pkl')

def init_db():
    os.makedirs('logs', exist_ok=True)
    conn = sqlite3.connect('logs/predictions.db')
    conn.execute('''CREATE TABLE IF NOT EXISTS predictions (
        id TEXT, text TEXT, channel TEXT, label TEXT,
        confidence REAL, nb_score REAL, svm_score REAL,
        latency_ms REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'text' not in data or 'channel' not in data:
        return jsonify({'error': 'Missing text or channel'}), 400

    text    = data['text']
    channel = data['channel']
    start   = time.time()

    clean     = preprocess(text, channel)
    vec       = tfidf.transform([clean])
    nb_score  = nb.predict_proba(vec)[0][1]
    svm_score = svm.predict_proba(vec)[0][1]

    confidence = round(0.50 * nb_score + 0.50 * svm_score, 3)
    label      = 'SPAM' if confidence > 0.3 else 'HAM'
    latency    = round((time.time() - start) * 1000, 2)

    conn = sqlite3.connect('logs/predictions.db')
    conn.execute(
        'INSERT INTO predictions (id,text,channel,label,confidence,nb_score,svm_score,latency_ms) VALUES (?,?,?,?,?,?,?,?)',
        (str(uuid.uuid4()), text[:500], channel, label, confidence, round(nb_score,3), round(svm_score,3), latency)
    )
    conn.commit()
    conn.close()

    return jsonify({'label': label, 'confidence': confidence,
                    'breakdown': {'nb': round(nb_score,3), 'svm': round(svm_score,3)},
                    'latency_ms': latency})

@app.route('/history', methods=['GET'])
def history():
    conn = sqlite3.connect('logs/predictions.db')
    rows = conn.execute(
        'SELECT text, channel, label, confidence, timestamp FROM predictions ORDER BY timestamp DESC LIMIT 50'
    ).fetchall()
    conn.close()
    return jsonify([{'text': r[0], 'channel': r[1], 'label': r[2],
                     'confidence': r[3], 'timestamp': r[4]} for r in rows])

@app.route('/stats', methods=['GET'])
def stats():
    conn = sqlite3.connect('logs/predictions.db')
    total  = conn.execute("SELECT COUNT(*) FROM predictions WHERE date(timestamp)=date('now')").fetchone()[0]
    spam   = conn.execute("SELECT COUNT(*) FROM predictions WHERE label='SPAM' AND date(timestamp)=date('now')").fetchone()[0]
    ham    = conn.execute("SELECT COUNT(*) FROM predictions WHERE label='HAM' AND date(timestamp)=date('now')").fetchone()[0]
    avg    = conn.execute("SELECT AVG(confidence) FROM predictions WHERE date(timestamp)=date('now')").fetchone()[0]
    conn.close()
    return jsonify({'total_today': total, 'spam_today': spam, 'ham_today': ham,
                    'avg_confidence': round(avg or 0, 3)})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'channels': ['sms', 'email', 'social']})

if __name__ == '__main__':
    app.run(debug=True, port=5000)