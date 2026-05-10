"""
Evaluation report - generates all dissertation metrics
per channel and overall.
"""
import pandas as pd
import joblib
import json
from sklearn.metrics import (
    classification_report, accuracy_score,
    roc_auc_score, confusion_matrix
)
from preprocess import preprocess

tfidf = joblib.load('models/tfidf.pkl')
nb    = joblib.load('models/nb.pkl')
svm   = joblib.load('models/svm.pkl')

def load_test_data():
    sms = pd.read_csv('data/SMSSpamCollection', sep='\t', header=None, names=['label','text'])
    sms['label_bin'] = (sms['label']=='spam').astype(int)
    sms['channel'] = 'sms'

    email = pd.read_csv('data/email_spam_data.csv')
    email['label_bin'] = (email['label']=='spam').astype(int)

    social = pd.read_csv('data/social_spam_data.csv')
    social['label_bin'] = (social['label']=='spam').astype(int)

    df = pd.concat([
        sms[['text','channel','label_bin']],
        email[['text','channel','label_bin']],
        social[['text','channel','label_bin']]
    ], ignore_index=True)

    # Use last 20% as test set
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    test = df.tail(int(len(df)*0.2))
    test['clean'] = test.apply(lambda r: preprocess(r['text'], r['channel']), axis=1)
    return test

def evaluate_model(name, model, X, y):
    pred  = model.predict(X)
    proba = model.predict_proba(X)[:,1]
    acc   = accuracy_score(y, pred)
    auc   = roc_auc_score(y, proba)
    report = classification_report(y, pred, target_names=['ham','spam'], output_dict=True)
    cm    = confusion_matrix(y, pred)
    fp_rate = cm[0][1] / (cm[0][0] + cm[0][1]) if (cm[0][0]+cm[0][1]) > 0 else 0

    print(f"\n{'='*40}")
    print(f"  {name}")
    print(f"{'='*40}")
    print(f"  Accuracy:      {acc:.4f}")
    print(f"  AUC-ROC:       {auc:.4f}")
    print(f"  F1 (spam):     {report['spam']['f1-score']:.4f}")
    print(f"  Precision:     {report['spam']['precision']:.4f}")
    print(f"  Recall:        {report['spam']['recall']:.4f}")
    print(f"  False Pos Rate:{fp_rate:.4f}")
    return {'accuracy': acc, 'auc': auc, 'f1': report['spam']['f1-score'],
            'precision': report['spam']['precision'], 'recall': report['spam']['recall'],
            'fpr': fp_rate}

def evaluate_per_channel(model, X_tfidf, test_df):
    print("\n--- Per Channel Breakdown ---")
    for ch in ['sms','email','social']:
        idx = test_df['channel'] == ch
        if idx.sum() == 0:
            continue
        X_ch = X_tfidf[idx.values]
        y_ch = test_df.loc[idx, 'label_bin']
        pred = model.predict(X_ch)
        acc  = accuracy_score(y_ch, pred)
        print(f"  {ch:8s}: accuracy={acc:.4f}  n={idx.sum()}")

print("\n" + "="*40)
print("  SPAM DETECTOR — EVALUATION REPORT")
print("="*40)

test = load_test_data()
X    = tfidf.transform(test['clean'])
y    = test['label_bin']

results = {}
results['Naive Bayes'] = evaluate_model('Naive Bayes', nb, X, y)
results['SVM']         = evaluate_model('SVM', svm, X, y)

# Ensemble
nb_proba  = nb.predict_proba(X)[:,1]
svm_proba = svm.predict_proba(X)[:,1]
ens_proba = 0.5*nb_proba + 0.5*svm_proba
ens_pred  = (ens_proba > 0.3).astype(int)
acc = accuracy_score(y, ens_pred)
auc = roc_auc_score(y, ens_proba)
report = classification_report(y, ens_pred, target_names=['ham','spam'], output_dict=True)
cm = confusion_matrix(y, ens_pred)
fpr = cm[0][1]/(cm[0][0]+cm[0][1]) if (cm[0][0]+cm[0][1])>0 else 0

print(f"\n{'='*40}")
print(f"  Ensemble (NB + SVM)")
print(f"{'='*40}")
print(f"  Accuracy:      {acc:.4f}")
print(f"  AUC-ROC:       {auc:.4f}")
print(f"  F1 (spam):     {report['spam']['f1-score']:.4f}")
print(f"  Precision:     {report['spam']['precision']:.4f}")
print(f"  Recall:        {report['spam']['recall']:.4f}")
print(f"  False Pos Rate:{fpr:.4f}")

evaluate_per_channel(svm, X, test)

print("\n" + "="*40)
print("  Report complete.")
print("="*40)
