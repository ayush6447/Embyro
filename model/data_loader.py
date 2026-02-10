import pandas as pd
import numpy as np
import tensorflow as tf
import os
import cv2

class BlastocystLoader:
    def __init__(self, csv_path, img_dir, batch_size=32, target_size=(224, 224), validation_split=0.2, augment=False):
        self.csv_path = csv_path
        self.img_dir = img_dir
        self.batch_size = batch_size
        self.target_size = target_size
        self.augment = augment
        
        # Load and clean data
        self.df = self._load_data()
        
        # Split into train/val
        # Shuffling locally to ensure randomness before split
        self.df = self.df.sample(frac=1, random_state=42).reset_index(drop=True)
        split_idx = int(len(self.df) * (1 - validation_split))
        self.train_df = self.df[:split_idx]
        self.val_df = self.df[split_idx:]
        
        print(f"Total samples: {len(self.df)}")
        print(f"Training samples: {len(self.train_df)}")
        print(f"Validation samples: {len(self.val_df)}")
        
    def _load_data(self):
        df = pd.read_csv(self.csv_path, sep=';') # CSV uses semi-colon separator
        df.columns = df.columns.str.strip() # Handle whitespace
        
        # Mapping for Grade to Numeric
        # 1-6 for Expansion?
        # A, B, C for ICM/TE -> usually mapped to 3, 2, 1 or similar in this dataset content
        # Looking at the file content provided:
        # Image;EXP_silver;ICM_silver;TE_silver
        # 0175_05.png;3;1;1
        # Values appear to be numeric already.
        # Need to handle 'ND' and 'NA'. 
        
        # Columns to check
        targets = [col for col in df.columns if 'EXP' in col or 'ICM' in col or 'TE' in col]
        
        # Replace ND/NA with NaN and drop or fill
        # Strategy: Drop rows with any NaN for simplicity in this baseline
        df[targets] = df[targets].replace(['ND', 'NA', '?'], np.nan)
        original_len = len(df)
        df = df.dropna(subset=targets)
        print(f"Dropped {original_len - len(df)} rows with missing/undefined labels.")
        
        # Convert to numeric
        for col in targets:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        return df

    def data_generator(self, dataframe):
        while True:
            # Shuffle every epoch
            dataframe = dataframe.sample(frac=1).reset_index(drop=True)
            
            for i in range(0, len(dataframe), self.batch_size):
                batch_df = dataframe.iloc[i:i+self.batch_size]
                
                images = []
                # Targets
                exp_labels = []
                icm_labels = []
                te_labels = []
                
                valid_batch_indices = []
                
                for idx, row in batch_df.iterrows():
                    img_name = row['Image']
                    img_path = os.path.join(self.img_dir, img_name)
                    
                    if not os.path.exists(img_path):
                        # Try searching recursively if structure is complex or just skip
                        found = False
                        for root, dirs, files in os.walk(self.img_dir):
                            if img_name in files:
                                img_path = os.path.join(root, img_name)
                                found = True
                                break
                        if not found:
                            continue
                            
                    try:
                        img = cv2.imread(img_path)
                        if img is None:
                            continue
                        
                        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                        img = cv2.resize(img, self.target_size)
                        img = img.astype(np.float32) / 255.0
                        
                        images.append(img)
                        
                        # Identify columns based on naming convention in CSV
                        # Assumes format like EXP_silver, ICM_silver...
                        exp_col = [c for c in row.index if 'EXP' in c][0]
                        icm_col = [c for c in row.index if 'ICM' in c][0]
                        te_col =  [c for c in row.index if 'TE'  in c][0]
                        
                        exp_labels.append(row[exp_col])
                        icm_labels.append(row[icm_col])
                        te_labels.append(row[te_col])
                        
                    except Exception as e:
                        print(f"Error loading {img_name}: {e}")
                        continue

                if not images:
                    continue
                    
                images = np.array(images)
                
                # Output dictionary for multi-output model
                # shape: (batch_size,)
                y = {
                    'exp_output': np.array(exp_labels),
                    'icm_output': np.array(icm_labels),
                    'te_output':  np.array(te_labels)
                }
                
                yield images, y

    def get_train_dataset(self):
        return self.data_generator(self.train_df)
    
    def get_val_dataset(self):
        return self.data_generator(self.val_df)
        
    def get_steps_per_epoch(self, split='train'):
        if split == 'train':
            return len(self.train_df) // self.batch_size
        return len(self.val_df) // self.batch_size
