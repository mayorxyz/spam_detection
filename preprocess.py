import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess(text, channel='sms'):
    # Channel-specific cleaning
    if channel == 'email':
        text = re.sub(r'<[^>]+>', ' ', text)  # strip HTML tags

    # Replace URLs and phone numbers with tokens
    text = re.sub(r'http\S+|www\S+', 'URL_TOKEN', text)
    text = re.sub(r'\+?\d[\d\s\-]{8,}\d', 'PHONE_TOKEN', text)

    # Lowercase, remove non-alphanumeric
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)

    # Tokenise, remove stopwords, lemmatize
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(t) for t in tokens if t not in stop_words and len(t) > 1]

    return ' '.join(tokens)
