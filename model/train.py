import tensorflow as tf
import os
import argparse
from model import build_multi_output_model
from data_loader import BlastocystLoader

def train(csv_path, img_dir, epochs=10, batch_size=32):
    # Data Loader
    loader = BlastocystLoader(csv_path, img_dir, batch_size=batch_size)
    
    train_gen = loader.get_train_dataset()
    val_gen = loader.get_val_dataset()
    
    steps_per_epoch = loader.get_steps_per_epoch('train')
    validation_steps = loader.get_steps_per_epoch('val')
    
    # Model build
    model = build_multi_output_model()
    
    # Compile
    # Using Mean Squared Error for simplified regression of grades
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss={
            'exp_output': 'mse',
            'icm_output': 'mse',
            'te_output': 'mse'
        },
        metrics={
            'exp_output': 'mae',
            'icm_output': 'mae',
            'te_output': 'mae'
        }
    )
    
    model.summary()
    
    # Config GPU Memory Growth
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError as e:
            print(e)

    # Train
    history = model.fit(
        train_gen,
        steps_per_epoch=steps_per_epoch,
        validation_data=val_gen,
        validation_steps=validation_steps,
        epochs=epochs,
        callbacks=[
            tf.keras.callbacks.ModelCheckpoint('best_model.keras', save_best_only=True),
            tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)
        ]
    )
    
    return history

if __name__ == "__main__":
    # Hardcoded paths for now based on user environment
    # c:/Users/Ayush Kumar/Documents/Embyro/blastocyst
    CSV_PATH = "../blastocyst/Gardner_train_silver.csv"
    IMG_DIR = "../blastocyst/Images"
    
    train(CSV_PATH, IMG_DIR)
