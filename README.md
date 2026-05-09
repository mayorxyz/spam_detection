# Spam Detector — Setup Guide

## 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

## 2. Download the SMS dataset
Go to: https://archive.ics.uci.edu/ml/machine-learning-databases/00228/smsspamcollection.zip
- Unzip it
- Place the file named `SMSSpamCollection` inside the `data/` folder

## 3. Train the models
```bash
python train.py
```
This creates `models/tfidf.pkl`, `models/nb.pkl`, `models/svm.pkl`

## 4. Start the API
```bash
python app.py
```
API runs at: http://localhost:5000

## 5. Test it
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Congratulations! You won a free iPhone. Click now!", "channel": "sms"}'
```

Expected response:
```json
{
  "label": "SPAM",
  "confidence": 0.923,
  "breakdown": {"nb": 0.891, "svm": 0.944},
  "latency_ms": 12.4
}
```

## Project Structure
```
spam_detector/
├── data/               ← put SMSSpamCollection here
├── models/             ← saved after training
├── logs/               ← SQLite DB auto-created
├── preprocess.py       ← text cleaning pipeline
├── train.py            ← trains NB + SVM models
├── app.py              ← Flask REST API
└── requirements.txt
```

## What's Next
- Phase 2: Add email channel + Enron dataset
- Phase 3: Add social media channel
- Phase 4: Build Gmail Chrome Extension
- Phase 5: Build Android SMS integration
