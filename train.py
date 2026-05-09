import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from preprocess import preprocess

DATA_PATH = 'data/SMSSpamCollection'
MODEL_DIR = 'models'

def load_sms_data():
    df = pd.read_csv(DATA_PATH, sep='\t', header=None, names=['label', 'text'])
    df['label_bin'] = (df['label'] == 'spam').astype(int)
    df['channel'] = 'sms'
    df['clean'] = df.apply(lambda r: preprocess(r['text'], r['channel']), axis=1)
    return df

def train():
    print("Loading data...")
    df = load_sms_data()
    print(f"Dataset: {len(df)} messages | Spam: {df['label_bin'].sum()} | Ham: {(df['label_bin']==0).sum()}")

    X_train, X_test, y_train, y_test = train_test_split(
        df['clean'], df['label_bin'], test_size=0.2, random_state=42, stratify=df['label_bin']
    )

    # TF-IDF
    print("Fitting TF-IDF...")
    tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_tfidf = tfidf.fit_transform(X_train)
    X_test_tfidf = tfidf.transform(X_test)

    # Naive Bayes
    print("Training Naive Bayes...")
    nb = MultinomialNB()
    nb.fit(X_train_tfidf, y_train)

    # SVM (calibrated for probability scores)
    print("Training SVM...")
    svm_base = LinearSVC(max_iter=1000)
    svm = CalibratedClassifierCV(svm_base, cv=3)
    svm.fit(X_train_tfidf, y_train)

    # Evaluate
    print("\n--- Naive Bayes ---")
    nb_pred = nb.predict(X_test_tfidf)
    print(classification_report(y_test, nb_pred, target_names=['ham', 'spam']))

    print("--- SVM ---")
    svm_pred = svm.predict(X_test_tfidf)
    print(classification_report(y_test, svm_pred, target_names=['ham', 'spam']))

    # Save models
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(tfidf, f'{MODEL_DIR}/tfidf.pkl')
    joblib.dump(nb,   f'{MODEL_DIR}/nb.pkl')
    joblib.dump(svm,  f'{MODEL_DIR}/svm.pkl')
    print(f"\nModels saved to {MODEL_DIR}/")

if __name__ == '__main__':
    train()
