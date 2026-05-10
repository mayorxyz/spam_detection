"""
Builds a labeled social media spam dataset.
Saves to data/social_spam_data.csv
"""
import pandas as pd
import random

random.seed(99)

SPAM = [
    "Follow me and I'll follow back! Get 10000 followers overnight http://fakefollow.com",
    "FREE Robux generator! Click here no survey needed http://robux.scam",
    "I made $500 today just by sharing this link you can too http://easymoney.biz",
    "DM me for investment tips I turned $100 into $10000 in one week",
    "Click the link in my bio to get a FREE iPhone 15 Pro limited time",
    "This diet pill melted 30 pounds in 2 weeks no exercise needed order now",
    "Subscribe to my OnlyFans link in bio exclusive content daily",
    "Crypto giveaway! Send 0.1 BTC get 1 BTC back Elon Musk approved",
    "You have been selected as our lucky winner claim your $1000 prize now",
    "Get verified on Instagram for just $5 DM me now limited slots",
    "I lost 20kg in 1 month using this one weird trick click to find out",
    "Free gift card generator working 2024 no human verification http://gift.scam",
    "Buy real Instagram followers 1000 followers for $2 instant delivery",
    "Join our telegram group for daily winning football predictions 95% accuracy",
    "Shoot your shot make money online $200 per day from your phone no skills",
    "This rapper gave away $10000 to random followers retweet to enter",
    "Warning your account will be deleted unless you verify http://fake-meta.com",
    "Hot singles near you are looking for a date click the link in bio",
    "Work from home earn $500 daily no experience needed DM me to start",
    "Free Netflix premium account generator link in bio hurry limited",
    "Retweet this and Bill Gates will donate $1 to charity for every retweet",
    "Flash sale 90% off designer bags only 10 left order now http://fake-shop.com",
    "I will promote your page to 100k followers for just $10 DM me",
    "Breaking news celebrity dies click to see who http://clickbait.scam",
    "Your phone has a virus download our free antivirus app now http://malware.fake",
]

HAM = [
    "Just finished my morning run feeling great ready to tackle the day",
    "Happy birthday to my best friend hope you have an amazing day",
    "Anyone else watching the game tonight? What a match so far",
    "Just tried the new coffee shop downtown highly recommend the cold brew",
    "Working from home today the dog keeps interrupting my meetings",
    "Finally finished reading that book took me three weeks but worth it",
    "Throwback to our trip to Paris last summer miss it so much",
    "The weather today is absolutely perfect going for a walk in the park",
    "Just got my exam results and I passed with distinction so relieved",
    "Cooking dinner for the family tonight trying a new pasta recipe",
    "Shoutout to everyone grinding hard this week the weekend is almost here",
    "Just donated to the local food bank if you can please consider doing the same",
    "My team won the championship today so proud of everyone involved",
    "Starting a new job next Monday nervous but excited for the challenge",
    "Reminder that mental health matters take a break if you need one",
    "Just adopted a rescue dog meet Charlie he is the best thing ever",
    "The sunset tonight was absolutely stunning nature never disappoints",
    "Finished my dissertation finally three years of hard work paid off",
    "Movie recommendation if you haven't seen Inception yet please do yourself a favour",
    "Power outage in our area for 3 hours appreciate electricity so much more now",
    "Spent the afternoon volunteering at the community garden so fulfilling",
    "Happy to announce I got accepted into my first choice university",
    "Road trip with friends this weekend cannot wait for the adventure",
    "Just learned how to make sushi at home it turned out surprisingly well",
    "Grateful for good friends who check in on you when life gets tough",
]

records = []
for _ in range(1200):
    records.append({'text': random.choice(SPAM), 'label': 'spam', 'channel': 'social'})
for _ in range(1200):
    records.append({'text': random.choice(HAM), 'label': 'ham', 'channel': 'social'})

random.shuffle(records)
df = pd.DataFrame(records)
df.to_csv('data/social_spam_data.csv', index=False)
print(f"Done. Total: {len(df)} | Spam: {(df.label=='spam').sum()} | Ham: {(df.label=='ham').sum()}")
print("Saved to data/social_spam_data.csv")
