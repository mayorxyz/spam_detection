# Multi-Channel Spam Detector

A local-first spam classification system that scores **SMS**, **email**, and **social**-style text using a **TF-IDF + Naive Bayes + SVM** ensemble, exposes a **Flask REST API**, and includes a **React (Vite)** dashboard for interactive testing, history, and daily stats.

The project is **feature-complete for local use** and suitable for extension (better datasets, thresholds, or models).

---

## Key features

- **Multi-channel preprocessing** — Shared pipeline with channel-aware steps (e.g. HTML stripping for `email`).
- **Ensemble scoring** — Combines calibrated Naive Bayes and SVM probabilities; configurable decision threshold in code (`app.py`).
- **Rule-based categories** — After SPAM/HAM, messages get a human-readable category (e.g. phishing, promotional) via keyword rules (`categorise.py`).
- **REST API** — `POST /predict`, `GET /history`, `GET /stats`, `GET /health` with CORS enabled for the dashboard.
- **SQLite logging** — Predictions are stored under `logs/predictions.db` for history and analytics.
- **Web dashboard** — Classifier, inbox-style view, history, charts, and API health polling.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| API | Python 3, **Flask**, **flask-cors** |
| ML | **scikit-learn** (TF-IDF, MultinomialNB, LinearSVC + calibration), **joblib** |
| NLP helpers | **NLTK** (stopwords, lemmatization — downloaded on first preprocess run) |
| Data | **pandas**, **numpy** |
| Dashboard | **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS 4**, **React Router** |
| Storage | **SQLite** (`logs/predictions.db`) |

`requirements.txt` also lists **PyTorch** and **transformers**; the current Python code does **not** import them. They are optional for future experiments; skip or remove those lines if you want a lighter install (see [Troubleshooting](#troubleshooting)).

---

## Project structure

```text
spam detection/
├── app.py                 # Flask API: predict, history, stats, health
├── train.py               # Train TF-IDF + NB + SVM on combined datasets
├── preprocess.py          # Text cleaning / tokenization pipeline
├── categorise.py          # Rule-based category labels after SPAM/HAM
├── evaluate.py            # Offline metrics report (NB, SVM, ensemble)
├── build_email_dataset.py # Generates synthetic data/email_spam_data.csv
├── build_social_dataset.py# Generates synthetic data/social_spam_data.csv
├── requirements.txt
├── data/
│   ├── SMSSpamCollection  # UCI SMS corpus (tab-separated, you add this)
│   ├── email_spam_data.csv
│   └── social_spam_data.csv
├── models/
│   ├── tfidf.pkl
│   ├── nb.pkl
│   └── svm.pkl
├── logs/
│   └── predictions.db     # Created automatically when the API runs
└── dashboard/             # React SPA (Vite)
    ├── .env.example
    ├── package.json
    └── src/
```

For a **file-by-file** breakdown (purpose, behavior, interactions), see [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md).

---

## Prerequisites

- **Python 3.10+** (3.13 used in development is fine)
- **Node.js 20+** (for the dashboard; includes `npm`)
- **Internet** (first run: NLTK data download; optional: fetch SMS dataset)

---

## Installation (step by step)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "spam detection"
```

### 2. Python environment and dependencies

Create a virtual environment (recommended):

```bash
python -m venv .venv
```

**Windows (PowerShell):**

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**macOS / Linux:**

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

If install is slow or fails on **torch/transformers**, install a minimal set instead:

```bash
pip install flask flask-cors scikit-learn pandas numpy nltk joblib
```

### 3. Datasets

**SMS (required for training as shipped):**

1. Download [SMSSpamCollection.zip](https://archive.ics.uci.edu/ml/machine-learning-databases/00228/smsspamcollection.zip) from the UCI repository.
2. Unzip and copy the file named **`SMSSpamCollection`** (no extension) into **`data/`**.

**Email and social CSVs:**

If `data/email_spam_data.csv` or `data/social_spam_data.csv` are missing, generate synthetic labeled data:

```bash
python build_email_dataset.py
python build_social_dataset.py
```

These scripts create balanced spam/ham samples for training and evaluation. Replace them with real corpora when you want production-grade accuracy.

### 4. Train models

From the project root (with venv active):

```bash
python train.py
```

This writes **`models/tfidf.pkl`**, **`models/nb.pkl`**, and **`models/svm.pkl`** and prints validation reports.

### 5. Dashboard dependencies

```bash
cd dashboard
npm install
cd ..
```

---

## Environment setup

### Flask (backend)

No `.env` file is required for the API. It listens on **port 5000** by default (`app.py`).

### Dashboard (frontend)

Optional environment variables live in **`dashboard/.env`** (copy from **`dashboard/.env.example`**).

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE` | Base URL of the Flask API (no trailing slash) | `http://localhost:5000` |

Example `dashboard/.env`:

```env
VITE_API_BASE=http://localhost:5000
```

After changing `.env`, restart the Vite dev server.

---

## Run locally

### Terminal 1 — API

From the **repository root**:

```bash
python app.py
```

- API base: **http://localhost:5000**
- Health check: **http://localhost:5000/health**

### Terminal 2 — Dashboard (optional)

```bash
cd dashboard
npm run dev
```

- App: **http://localhost:5173** (see `vite.config.ts` if the port differs)

Open the dashboard in a browser. It calls the API using `VITE_API_BASE` (or localhost).

### Quick API test (curl)

```bash
curl -X POST http://localhost:5000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"text\": \"Congratulations! You won a free iPhone. Click now!\", \"channel\": \"sms\"}"
```

Example JSON response:

```json
{
  "label": "SPAM",
  "category": "Scam / Fraud",
  "confidence": 0.923,
  "breakdown": {"nb": 0.891, "svm": 0.944},
  "latency_ms": 12.4
}
```

### Evaluation script

After models exist:

```bash
python evaluate.py
```

Prints accuracy, AUC, F1, and per-channel breakdown for NB, SVM, and the ensemble.

---

## Expose the API with ngrok (optional)

Use **ngrok** when you need a **public HTTPS URL** for the Flask API (mobile clients, webhooks, or a remote frontend).

1. Install [ngrok](https://ngrok.com/download) and authenticate per ngrok docs.
2. Start the API: `python app.py` (port **5000**).
3. In another terminal:

   ```bash
   ngrok http 5000
   ```

4. Copy the **HTTPS** forwarding URL (e.g. `https://abc123.ngrok-free.app`).

5. **Dashboard:** set `VITE_API_BASE` to that URL (no trailing slash), restart `npm run dev`.

6. **CORS:** Flask uses `flask_cors` with default permissive settings for development. For production, restrict origins to your real frontend domain.

**Note:** Free ngrok URLs change unless you use a reserved domain. Anyone with the URL can call your API while it is tunneled — treat it like a temporary demo endpoint.

---

## Usage

### Channels

Send `channel` as one of: **`sms`**, **`email`**, **`social`**. Preprocessing uses this for rules such as stripping HTML when `channel` is `email`.

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/predict` | Body: `{"text": "...", "channel": "sms\|email\|social"}`. Returns label, category, confidence, model breakdown, latency. |
| `GET` | `/history` | Last 50 predictions from SQLite. |
| `GET` | `/stats` | Today’s counts, average confidence, top categories. |
| `GET` | `/health` | `{ "status": "ok", "channels": [...] }` |

### Dashboard routes

- **`/`** — Classifier (submit text, see result).
- **`/inbox`** — Inbox-style demo view.
- **`/history`** — Recent predictions from the API.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| `FileNotFoundError` for `*.pkl` | Run `python train.py` from the project root after placing data in `data/`. |
| Missing `SMSSpamCollection` | Download UCI zip and place the file in `data/` (see [Datasets](#3-datasets)). |
| Missing email/social CSV | Run `build_email_dataset.py` and `build_social_dataset.py`. |
| NLTK download errors / firewall | Allow Python outbound HTTPS, or pre-download NLTK corpora on a machine with access and copy the NLTK data directory. |
| `pip install` fails on torch | Use the minimal `pip install` line in [Installation](#2-python-environment-and-dependencies) or remove `torch` / `transformers` from `requirements.txt`. |
| Dashboard shows offline banner | Ensure `python app.py` is running and `VITE_API_BASE` matches the API URL (including ngrok URL if used). |
| CORS errors in browser | Confirm API is running; check you are not mixing `http`/`https` incorrectly; for production, configure CORS origins explicitly. |
| Port 5000 already in use | Stop the other process or change `app.run(..., port=5000)` in `app.py` and update `VITE_API_BASE` / curl URLs. |
| Wrong predictions | Retrain with better data; adjust the spam threshold in `app.py` (`confidence > 0.3`); tune `categorise.py` rules. |

---

## Contributing

1. **Fork / branch** from the main development branch.
2. **Set up** Python venv + `pip install` and `dashboard/npm install` as above.
3. **Run** `python train.py` (if you change data or training) and smoke-test `python app.py` + `npm run dev`.
4. **Keep changes focused** — one concern per PR when possible.
5. **Document** new env vars, endpoints, or data files in this README and [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md).

---

## License

No license file is present in this repository. **All rights reserved** unless and until a `LICENSE` file is added. Replace this section with the chosen license (e.g. MIT, Apache-2.0) when you decide.

---

## Further reading

- **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** — Architecture, data flow, request handling, dependencies rationale, and detailed file reference.
