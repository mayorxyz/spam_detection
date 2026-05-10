import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from preprocess import preprocess

MODEL_DIR = 'models'

def load_data():
    # SMS
    sms = pd.read_csv('data/SMSSpamCollection', sep='\t', header=None, names=['label', 'text'])
    sms['label_bin'] = (sms['label'] == 'spam').astype(int)
    sms['channel'] = 'sms'

    # Email
    email = pd.read_csv('data/email_spam_data.csv')
    email['label_bin'] = (email['label'] == 'spam').astype(int)

    # Social
    social = pd.read_csv('data/social_spam_data.csv')
    social['label_bin'] = (social['label'] == 'spam').astype(int)

    df = pd.concat([
        sms[['text', 'channel', 'label_bin']],
        email[['text', 'channel', 'label_bin']],
        social[['text', 'channel', 'label_bin']]
    ], ignore_index=True)

    df['clean'] = df.apply(lambda r: preprocess(r['text'], r['channel']), axis=1)
    return df

def train():
    print("Loading data...")
    df = load_data()

    for ch in df['channel'].unique():
        sub = df[df['channel'] == ch]
        print(f"  {ch}: {len(sub)} | spam: {sub['label_bin'].sum()} | ham: {(sub['label_bin']==0).sum()}")
    print(f"  TOTAL: {len(df)}")

    X_train, X_test, y_train, y_test = train_test_split(
        df['clean'], df['label_bin'], test_size=0.2, random_state=42, stratify=df['label_bin']
    )

    print("\nFitting TF-IDF...")
    tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_tfidf = tfidf.fit_transform(X_train)
    X_test_tfidf  = tfidf.transform(X_test)

    print("Training Naive Bayes...")
    nb = MultinomialNB()
    nb.fit(X_train_tfidf, y_train)

    print("Training SVM...")
    svm = CalibratedClassifierCV(LinearSVC(max_iter=1000), cv=3)
    svm.fit(X_train_tfidf, y_train)

    print("\n--- Naive Bayes ---")
    print(classification_report(y_test, nb.predict(X_test_tfidf), target_names=['ham', 'spam']))
    print("--- SVM ---")
    print(classification_report(y_test, svm.predict(X_test_tfidf), target_names=['ham', 'spam']))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(tfidf, f'{MODEL_DIR}/tfidf.pkl')
    joblib.dump(nb,    f'{MODEL_DIR}/nb.pkl')
    joblib.dump(svm,   f'{MODEL_DIR}/svm.pkl')
    print(f"\nModels saved to {MODEL_DIR}/")

if __name__ == '__main__':
    train()