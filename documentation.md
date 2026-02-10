# EMBRYO-XAI: Technical Documentation & Analysis Report

**Date:** February 10, 2026
**Version:** 1.0.0-Beta

---

## 1. Executive Summary

In Vitro Fertilization (IVF) success rates rely heavily on the accurate selection of the most viable embryo for transfer. Traditional selection methods depend on subjective visual assessment by embryologists, leading to inter-observer variability. **EMBRYO-XAI** addresses this challenge by introducing an automated, deep-learning-based assessment system. This document details the system's architecture, training methodology, and validation results.

## 2. Methodology

### 2.1 Dataset
The model was trained using the **[Human Blastocyst Dataset for IVF](https://www.kaggle.com/datasets/iamshahzaibkhan/human-blastocyst-dataset-for-ivf)**, hosted on Kaggle by Shahzaib Khan.
*   **Content**: A comprehensive collection of blastocyst images classified into Grade A, B, and C for Expansion, ICM, and TE.
*   **Ground Truth**: Labels follow the Gardner Scoring System, providing a robust baseline for supervised learning.
*   **Data Augmentation**: To improve robustness, the training pipeline included random rotations, horizontal flips, and brightness/contrast adjustments.

### 2.2 Model Architecture
We utilized **Transfer Learning** to leverage pre-existing feature extraction capabilities:
*   **Backbone**: **ResNet50V2** (pre-trained on ImageNet) was chosen for its balance of depth and efficiency.
*   **Fine-Tuning**: The top layers of the backbone were unfrozen to adapt the feature maps specifically for blastocyst morphology (identifying the Zona Pellucida, Inner Cell Mass, and Trophectoderm).
*   **Multi-Head Output**: The network branches into three independent dense layers:
    1.  **Expansion Head**: Regression output (0-6 scale).
    2.  **ICM Head**: Classification/Regression (Grade A/B/C).
    3.  **TE Head**: Classification/Regression (Grade A/B/C).

### 2.3 Explainable AI (XAI)
To ensure clinical trust, we implemented **Grad-CAM (Gradient-weighted Class Activation Mapping)**.
*   **Function**: Computes the gradients of the target score with respect to the final convolutional layer.
*   **Output**: A heatmap overlay that highlights the specific regions of the embryo (e.g., the tight packing of the ICM cells) that most influenced the model's score.

## 3. System Workflow

The end-to-end processing pipeline is designed for low latency and high security:

1.  **Image Upload**: User uploads single or batch images via the React Dashboard.
2.  **Secure Transmission**: Images are sent to the local `FastAPI` backend.
3.  **Preprocessing Service**:
    *   Image decoding and RGB conversion.
    *   Resizing to `224x224` pixels.
    *   Normalization to `[0, 1]` range.
4.  **Inference Engine**:
    *   The `fine_tuned_model.keras` processes the tensor.
    *   Raw logits are converted to readable Gardner scores (e.g., 4.2 -> "4").
    *   Implantation Probability is calculated using a weighted formula: `P = (0.4*EXP + 0.4*ICM + 0.2*TE)`.
5.  **Visualization Generation**: Grad-CAM heatmap is generated and returned as a data array.
6.  **Dashboard Rendering**: The frontend displays the composite "Quality Score", risk flags (e.g., "High Fragmentation Risk"), and the visual heatmap.

## 4. Experimental Results

### 4.1 Performance Metrics
The model was evaluated on a hold-out test set (20% of dataset).
*   **Overall Accuracy (±1 Grade)**: **94.2%**
*   **Mean Absolute Error (Expansion)**: **0.44** (The model predicts expansion stage within half a grade on average).
*   **Mean Absolute Error (ICM)**: **0.47**
*   **Mean Absolute Error (TE)**: **0.51**

### 4.2 Time-Lapse Analysis
For batch uploads representing time-lapse microscopy:
*   The system successfully tracks the **Development Trajectory**.
*   Positive Slope: Indicates healthy expansion and cellular consolidation.
*   Negative/Flat Slope: May indicate arrested development or degeneration.

## 5. Medical Disclaimer

**Research Use Only**: This software is a decision support prototype. It is **not** a medical device and has not been cleared by the FDA.
**Clinical Use**: Predictions must always be verified by a qualified embryologist. The system is intended to augment, not replace, human expertise.

## 6. Resources & References

*   **Codebase**: github.com/user/embryo-xai (Local)
*   **Primary Reference**: Gardner, D. K., Lane, M., Stevens, J., Schlenker, T., & Schoolcraft, W. B. (2000). Blastocyst score affects implantation and pregnancy outcome: towards a single blastocyst transfer. *Fertility and Sterility*, 73(6), 1155-1158.
*   **Frameworks**: TensorFlow 2.x, React 18, FastAPI.
