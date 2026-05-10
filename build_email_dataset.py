"""
Builds a labeled email dataset and saves to data/email_spam_data.csv
"""
import pandas as pd
import random

random.seed(42)

SPAM = [
    "Dear customer your account has been suspended click here to verify http://fake-bank.com",
    "WINNER You have been selected for a 1000 dollar gift card claim now at http://prizes.win",
    "Urgent your PayPal account needs verification login at http://paypal-secure.xyz",
    "Congratulations you won a FREE iPhone text YES to 88001 to claim your prize",
    "FINAL NOTICE your invoice is overdue pay now to avoid legal action http://debt.collect",
    "Make 5000 a week from home no experience needed join now http://easymoney.biz",
    "Your Netflix account will be closed update billing info http://netflix-update.xyz",
    "Buy cheap meds online no prescription needed Viagra Cialis from 0.99 dollars",
    "Investment opportunity earn 300 percent returns guaranteed limited spots available",
    "You have a pending package delivery confirm address http://fake-dhl.com",
    "FREE credit score check no card needed visit http://freecredit.scam",
    "Lose 30 pounds in 30 days revolutionary diet pill order now get 50 percent off",
    "Your computer has a virus call Microsoft support now 1-800-FAKE-NUM",
    "Exclusive casino bonus 500 dollars free play now http://casino-spam.com",
    "Dear beneficiary I am barrister John Smith I have 15 million dollars to transfer to you",
    "URGENT IRS notice you owe back taxes call immediately to avoid arrest",
    "Refinance your mortgage lowest rates guaranteed apply in 2 minutes",
    "You are pre-approved for a 50000 dollar loan no credit check apply now",
    "Work from home opportunity earn 200 dollars per hour no skills required",
    "Hot singles in your area are waiting meet them now http://dating-spam.com",
    "Get rich quick guaranteed returns on crypto investment join our VIP group now",
    "Your email storage is full click here to upgrade your account immediately",
    "Claim your lottery winnings you have been randomly selected as our winner",
    "Special promotion buy one get one free limited time offer expires tonight",
    "Verify your bank account now or it will be permanently suspended within 24 hours",
    "You qualify for a government grant apply now no repayment required free money",
    "Earn passive income while you sleep our system does all the work for you",
    "Your password was compromised click here to reset it immediately http://reset.fake",
    "Exclusive membership offer join now and get access to premium content for free",
    "Warning your subscription has expired renew now to avoid losing your data",
]

HAM = [
    "Hi just following up on our meeting scheduled for Thursday at 2pm let me know if that works",
    "Please find attached the quarterly report as discussed let me know if you have questions",
    "Thanks for your email I will be out of office until Monday I will respond when I return",
    "The team meeting has been moved to 3pm today please update your calendars accordingly",
    "Can you review the pull request I submitted yesterday I need feedback before the deadline",
    "Reminder your dentist appointment is tomorrow at 10am please call to confirm",
    "Happy birthday hope you have a wonderful day celebrating with family and friends",
    "The project deadline has been extended by one week please update your deliverables",
    "I wanted to check in on the status of the report when do you think it will be ready",
    "Thank you for attending the conference here are the slides from todays presentation",
    "Just a heads up the client call has been rescheduled to next Tuesday at noon",
    "Could you please send me the budget spreadsheet when you get a chance thanks",
    "The new feature has been deployed to production please verify it works on your end",
    "Lunch today at 1pm at the usual place let me know if you can make it",
    "I have reviewed your proposal and have a few minor suggestions to discuss",
    "The invoice has been processed and payment will be made within 5 business days",
    "Please complete the mandatory training module before the end of the month",
    "Your flight booking confirmation is attached please review the details",
    "We are pleased to inform you that your job application has progressed to the next stage",
    "The server maintenance is scheduled for this weekend from midnight to 4am",
    "Could we reschedule our call to Friday afternoon I have a conflict on Thursday",
    "The annual performance review process starts next month please prepare your self assessment",
    "Great work on the presentation today the client was very impressed with the results",
    "I have cc'd Sarah on this email as she will be taking over the project from next week",
    "The office will be closed on Monday for the public holiday normal hours resume Tuesday",
    "Please review the attached contract and let me know if you have any concerns",
    "Your order has been shipped and is expected to arrive within 3 to 5 business days",
    "We would like to invite you to our annual company dinner on the 15th of next month",
    "The bug you reported has been fixed and the patch will be released tomorrow morning",
    "Thank you for your feedback we have passed it along to the relevant team for review",
]

records = []
for i in range(1200):
    base = random.choice(SPAM)
    records.append({'text': base, 'label': 'spam', 'channel': 'email'})
for i in range(1200):
    base = random.choice(HAM)
    records.append({'text': base, 'label': 'ham', 'channel': 'email'})

random.shuffle(records)
df = pd.DataFrame(records)
df.to_csv('data/email_spam_data.csv', index=False)
print(f"Done. Total: {len(df)} | Spam: {(df.label=='spam').sum()} | Ham: {(df.label=='ham').sum()}")
print("Saved to data/email_spam_data.csv")