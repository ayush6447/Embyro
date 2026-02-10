import pandas as pd
import numpy as np
import tensorflow as tf
from model import build_multi_output_model
import argparse
import os
import cv2

def evaluate(csv_path, img_dir, weights_path):
    print(f"Loading weights from {weights_path}...")
    model = build_multi_output_model()
    model.load_weights(weights_path)
    
    print(f"Reading CSV from {csv_path}...")
    try:
        df = pd.read_csv(csv_path, sep=';')
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # Clean column names
    df.columns = df.columns.str.strip()
    print(f"Columns: {df.columns.tolist()}")

    # Identify target columns
    try:
        exp_col = [c for c in df.columns if 'EXP' in c][0]
        icm_col = [c for c in df.columns if 'ICM' in c][0]
        te_col  = [c for c in df.columns if 'TE'  in c][0]
        print(f"Target columns: {exp_col}, {icm_col}, {te_col}")
    except IndexError:
        print("Could not find one of EXP/ICM/TE columns.")
        return

    # Filter NaN
    targets = [exp_col, icm_col, te_col]
    # Coerce to numeric
    for col in targets:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        
    original_len = len(df)
    df = df.dropna(subset=targets)
    print(f"Evaluated on {len(df)} samples (dropped {original_len - len(df)})")
    
    maes = {'exp': [], 'icm': [], 'te': []}
    
    for idx, row in df.iterrows():
        img_name = row['Image']
        img_path = os.path.join(img_dir, img_name)
        
        if not os.path.exists(img_path):
            # print(f"Image not found: {img_path}")
            continue
            
        try:
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (224, 224))
            img = img.astype(np.float32) / 255.0
            img = np.expand_dims(img, axis=0)
            
            preds = model.predict(img, verbose=0)
            
            exp_pred = preds[0][0][0]
            icm_pred = preds[1][0][0]
            te_pred = preds[2][0][0]
            
            exp_true = row[exp_col]
            icm_true = row[icm_col]
            te_true  = row[te_col]
            
            maes['exp'].append(abs(exp_pred - exp_true))
            maes['icm'].append(abs(icm_pred - icm_true))
            maes['te'].append(abs(te_pred - te_true))
            
        except Exception as e:
            print(f"Error processing {img_name}: {e}")
            continue

    if not maes['exp']:
        print("No samples evaluated.")
        return

    print("Optimization finished.")
    print(f"MAE Expansion: {np.mean(maes['exp']):.4f}")
    print(f"MAE ICM: {np.mean(maes['icm']):.4f}")
    print(f"MAE TE: {np.mean(maes['te']):.4f}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True)
    parser.add_argument("--img_dir", required=True)
    parser.add_argument("--weights", default="best_model.keras")
    args = parser.parse_args()
    
    evaluate(args.csv, args.img_dir, args.weights)
