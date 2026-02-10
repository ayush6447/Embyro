import tensorflow as tf
from tensorflow.keras import layers, models, applications

def build_multi_output_model(input_shape=(224, 224, 3)):
    """
    Builds a Multi-Output CNN for Gardner Grading.
    """
    
    # Backbone: ResNet50V2
    base_model = applications.ResNet50V2(
        weights='imagenet', 
        include_top=False, 
        input_shape=input_shape
    )
    
    # Freeze initial layers
    base_model.trainable = False
    
    # Feature extraction
    x = base_model.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.5)(x)
    
    # Head 1: Expansion Score (EXP)
    # Regression or Ordinal Classification
    exp_features = layers.Dense(128, activation='relu')(x)
    exp_output = layers.Dense(1, activation='linear', name='exp_output')(exp_features)
    
    # Head 2: Inner Cell Mass (ICM)
    icm_features = layers.Dense(128, activation='relu')(x)
    icm_output = layers.Dense(1, activation='linear', name='icm_output')(icm_features)
    
    # Head 3: Trophectoderm (TE)
    te_features = layers.Dense(128, activation='relu')(x)
    te_output = layers.Dense(1, activation='linear', name='te_output')(te_features)
    
    # Combined Model
    model = models.Model(
        inputs=base_model.input, 
        outputs=[exp_output, icm_output, te_output]
    )
    
    return model
