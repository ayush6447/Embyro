# EmbryogenAI: Precision IVF Assessment System

![Status](https://img.shields.io/badge/Status-Beta-emerald) ![License](https://img.shields.io/badge/License-MIT-blue) ![Tech](https://img.shields.io/badge/Stack-FastAPI%20|%20React%20|%20TensorFlow-orange)

**EmbryogenAI** is an advanced, computer-vision analytical tool designed to assist embryologists in assessing blastocyst quality. Leveraging a **ResNet50V2** deep learning architecture, it provides objective, consistent grading (Gardner Scale) and implantation probability predictions, backed by explainable AI (Grad-CAM) visualizations.

> ⚠️ **Disclaimer:** This tool is for **Research Use Only**. It has not been approved by the FDA or any regulatory authority for clinical diagnosis.

---

## 🚀 Key Features

*   **Automated Gardner Grading**: Instantly predicts Expansion score, Inner Cell Mass (ICM) grade, and Trophectoderm (TE) grade.
*   **Implantation Probability**: improved predictive model correlates morphological features with potential implantation success.
*   **Explainable AI (XAI)**: **Grad-CAM** heatmaps highlight exactly *where* the model is looking, building trust in automation.
*   **Time-Lapse Analysis**: Upload batch images to visualize the **Development Trajectory** graph, tracking embryo quality over time.
*   **Privacy-First Architecture**: All processing runs locally; patient data never leaves your secure infrastructure.

---

## 🛠️ Technology Stack

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS (v4), Recharts, Framer Motion.
*   **Backend**: Python, FastAPI, Uvicorn.
*   **AI/ML**: TensorFlow/Keras, ResNet50V2 (Transfer Learning), OpenCV.
*   **Data Processing**: Pandas, NumPy.

---

## 🏁 Quick Start Guide

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Ensure fine_tuned_model.keras is in backend/app/models/
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend-react
npm install
npm run dev
```

### 3. Usage
Open `http://localhost:5173`. Drag and drop blastocyst images (single or batch) to receive instant analysis.

---

## 📊 Workflow Architecture

1.  **Input**: High-resolution brightfield microscopy images (Day 5/6 Blastocysts).
2.  **Preprocessing**: Images are resized (224x224), normalized, and optionally CLAHE-enhanced.
3.  **Inference**:
    *   **ResNet50V2** extracts deep morphological features.
    *   **Multi-Head Output Layers** predict EXP (Scalar), ICM (Class), and TE (Class) independently.
4.  **Post-Processing**: Raw outputs are synthesized into a 0-100 Quality Score.
5.  **Visualization**: The React dashboard renders metrics, risk flags, and overlays Grad-CAM attention maps.

---

## 📂 Project Structure

```
EMBRYO-XAI/
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── services/       # ML Inference & Grad-CAM Logic
│   │   └── main.py         # API Entry Point
│   └── requirements.txt
├── frontend-react/         # Modern Dashboard
│   ├── src/
│   │   ├── components/     # Reusable UI (UploadZone, HeatmapViewer)
│   │   └── App.tsx         # Main Logic
│   └── tailwind.config.js
├── model/                  # Training Scripts
│   ├── train.py
│   ├── evaluate.py
│   └── data_loader.py
└── README.md
```

---

## 🔬 Acknowledgements
*   **Dataset**: [Human Blastocyst Dataset for IVF](https://www.kaggle.com/datasets/iamshahzaibkhan/human-blastocyst-dataset-for-ivf) by Shahzaib Khan.
*   Based on research by *Gardner, D. K., & Schoolcraft, W. B. (1999)*.
