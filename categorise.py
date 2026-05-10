"""
Rule-based message categoriser.
Called after spam/ham decision to assign a specific category.
"""

SPAM_RULES = [
    ("Phishing", [
        "verify", "suspended", "account", "login", "password", "bank", "paypal",
        "credit card", "billing", "confirm your", "click here", "update your",
        "unusual activity", "unauthorized", "security alert", "validate"
    ]),
    ("Scam / Fraud", [
        "winner", "won", "prize", "lottery", "million dollar", "beneficiary",
        "inheritance", "barrister", "attorney", "transfer funds", "nigerian",
        "get rich", "guaranteed returns", "investment opportunity", "double your money",
        "grant", "unclaimed", "selected for"
    ]),
    ("Malware / Suspicious Link", [
        "http://", "https://", "bit.ly", "tinyurl", "click now", "download",
        "install", "free software", "crack", "keygen", "virus detected",
        "your computer", "malware", "trojan", "exe", "zip file"
    ]),
    ("Adult / Inappropriate", [
        "singles", "dating", "hot girls", "meet women", "adult", "xxx",
        "naked", "hookup", "sex", "erotic", "onlyfans"
    ]),
    ("Promotional Spam", [
        "buy now", "order now", "limited offer", "expires", "discount",
        "cheap", "free trial", "no prescription", "weight loss", "diet pill",
        "earn money", "work from home", "passive income", "make money"
    ]),
]

HAM_RULES = [
    ("Work / Business", [
        "meeting", "invoice", "report", "deadline", "project", "client",
        "proposal", "budget", "presentation", "conference", "colleague",
        "manager", "team", "office", "schedule", "contract", "quarterly"
    ]),
    ("School / Academic", [
        "assignment", "homework", "exam", "lecture", "professor", "course",
        "university", "college", "grade", "student", "semester", "thesis",
        "dissertation", "research", "class", "tutor", "submit"
    ]),
    ("Personal", [
        "birthday", "family", "friend", "dinner", "lunch", "party",
        "weekend", "holiday", "vacation", "love", "miss you", "how are you",
        "catch up", "congrats", "congratulations", "wedding", "baby"
    ]),
    ("Notifications / Alerts", [
        "reminder", "confirmation", "booking", "appointment", "delivery",
        "shipped", "tracking", "order", "receipt", "subscription",
        "password reset", "verification code", "otp", "your code"
    ]),
    ("Promotions / Marketing", [
        "offer", "sale", "deal", "discount", "newsletter", "unsubscribe",
        "promotion", "coupon", "reward", "loyalty", "membership", "exclusive"
    ]),
]

def categorise(text, label):
    """
    Given cleaned text and spam/ham label, return a category string.
    """
    text_lower = text.lower()

    rules = SPAM_RULES if label == 'SPAM' else HAM_RULES

    scores = {}
    for category, keywords in rules:
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[category] = score

    best = max(scores, key=scores.get)

    # If no keywords matched at all, return generic
    if scores[best] == 0:
        return "General Spam" if label == 'SPAM' else "General"

    return best
