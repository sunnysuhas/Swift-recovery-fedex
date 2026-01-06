
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
import pickle

def train_model():
    # Load Data
    try:
        df = pd.read_csv('training_data.csv')
    except:
        print("Please run generate_data.py first")
        return

    # Preprocessing
    # Encode Industry
    df = pd.get_dummies(df, columns=['industry_sector'], drop_first=True)
    
    X = df.drop('recovered', axis=1)
    y = df['recovered']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    model = xgb.XGBClassifier(objective='binary:logistic', n_estimators=100, learning_rate=0.1, max_depth=5)
    model.fit(X_train, y_train)
    
    # Eval
    probs = model.predict_proba(X_test)[:, 1]
    preds = model.predict(X_test)
    
    print("Accuracy:", accuracy_score(y_test, preds))
    print("AUC:", roc_auc_score(y_test, probs))
    print("\nReport:\n", classification_report(y_test, preds))
    
    # Save
    with open('recovery_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model saved to recovery_model.pkl")

if __name__ == "__main__":
    train_model()
