
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_training_data(n_samples=2000):
    data = []
    
    sectors = ['Retail', 'Finance', 'Healthcare', 'Telco', 'Utilities']
    
    for i in range(n_samples):
        amount = random.uniform(100, 50000)
        days_overdue = random.randint(30, 365)
        payment_history_score = random.randint(0, 100) # 0=Bad, 100=Good
        industry = random.choice(sectors)
        prev_attempts = random.randint(0, 5)
        
        # Logic for target variable (Recovery)
        # Higher score, lower days, lower attempts -> Higher chance
        prob = (payment_history_score / 100) * 0.4 + (1 - min(days_overdue/365, 1)) * 0.4 - (prev_attempts * 0.05)
        prob += random.uniform(-0.1, 0.1) # Noise
        
        recovered = 1 if prob > 0.5 else 0
        
        data.append({
            'amount': amount,
            'days_overdue': days_overdue,
            'customer_payment_history_score': payment_history_score,
            'industry_sector': industry,
            'previous_dca_attempts': prev_attempts,
            'recovered': recovered
        })
        
    df = pd.DataFrame(data)
    df.to_csv('training_data.csv', index=False)
    print("Training data generated: training_data.csv")

if __name__ == "__main__":
    generate_training_data()
