import tensorflow as tf
import numpy as np
import cv2
import matplotlib
matplotlib.use('Agg') # No display
import matplotlib.pyplot as plt
import argparse
import os

# We need to recreate the model structure exactly as in training
from model import build_multi_output_model

def get_gradcam_heatmap(model, img_array, target_head_name, last_conv_layer_name):
    print(f"Generating Grad-CAM for head: {target_head_name} using layer: {last_conv_layer_name}")
    
    # Create a model with access to intermediate layers
    grad_model = tf.keras.models.Model(
        inputs=[model.inputs],
        outputs=[model.get_layer(last_conv_layer_name).output, model.get_layer(target_head_name).output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        # Predictions shape: (1, 1) due to linear activation usually
        loss = predictions[:, 0]

    # Compute gradients of the target class score wrt feature maps
    grads = tape.gradient(loss, conv_outputs)
    
    # Global Average Pooling of gradients
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weighted sum of feature maps
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # ReLU on heatmap
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def save_visualization(img_path, heatmap, output_path="explanation.png"):
    img = cv2.imread(img_path)
    img = cv2.resize(img, (224, 224))
    
    # Resize heatmap to match image size
    heatmap = cv2.resize(heatmap, (224, 224))

    # Rescale heatmap to 0-255
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # Superimpose
    superimposed_img = heatmap * 0.4 + img
    cv2.imwrite(output_path, superimposed_img)
    print(f"Saved explanation to {output_path}")

def explain(image_path, weights_path, head='exp_output'):
    model = build_multi_output_model()
    
    if os.path.exists(weights_path):
        model.load_weights(weights_path)
        print("Loaded model weights.")
    else:
        print(f"Weights file {weights_path} not found. Using untrained weights.")

    img = cv2.imread(image_path)
    if img is None:
        print(f"Could not load image {image_path}")
        return

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img_array = np.expand_dims(img.astype(np.float32) / 255.0, axis=0)

    # Identify last conv layer
    # For ResNet50V2, 'post_relu' is common.
    # Alternatively find the last Conv2D or Relu layer before GAP
    layer_name = 'post_relu'
    try:
        model.get_layer(layer_name)
    except ValueError:
        # Fallback: List layers and pick one
        # This part requires inspection of model.summary()
        # For ResNet50V2 included in Keras, 'post_relu' exists.
        print(f"Layer {layer_name} not found. Searching for substitute.")
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Activation) or 'relu' in layer.name:
                layer_name = layer.name
                break
    
    heatmap = get_gradcam_heatmap(model, img_array, head, layer_name)
    save_visualization(image_path, heatmap)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--weights", default="best_model.keras", help="Path to weights")
    parser.add_argument("--head", default="exp_output", choices=['exp_output', 'icm_output', 'te_output'])
    args = parser.parse_args()
    
    explain(args.image, args.weights, args.head)
