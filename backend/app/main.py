from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

from .schemas import (
    EmbryoAnalysisResponse,
    RiskIndicator,
)
from .services.analysis import analyze_embryo_batch


app = FastAPI(
    title="EMBRYO-XAI Backend",
    description=(
        "Explainable AI System for IVF Embryo Quality Assessment.\n"
        "Current version uses random values as placeholders for ML model outputs.\n"
        "Model integration hooks are provided in app/services/analysis.py."
    ),
    version="0.1.0",
)


# Allow local frontends (React & Streamlit) to call the API easily
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "embryo-xai-backend"}


@app.post("/api/v1/analyze", response_model=List[EmbryoAnalysisResponse])
async def analyze_endpoint(
    files: List[UploadFile] = File(..., description="Embryo image files (time-lapse frames)"),
    maternal_age: Optional[int] = Form(None),
    fertilization_method: Optional[str] = Form(None),
) -> List[EmbryoAnalysisResponse]:
    """
    Analyze one or more embryo images and return a quality score,
    implantation probability, risk indicators, and a placeholder
    heatmap explanation for each.

    NOTE: For now, this uses random values instead of real ML models.
    The integration point for CNN/LSTM + XAI is in services/analysis.py.
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one embryo image must be uploaded.")

    # Read file bytes into memory (for now; later you may stream / store)
    image_bytes_list: List[bytes] = []
    for f in files:
        content = await f.read()
        if not content:
            raise HTTPException(status_code=400, detail=f"File {f.filename} is empty.")
        image_bytes_list.append(content)

    meta = {
        "maternal_age": maternal_age,
        "fertilization_method": fertilization_method,
    }

    responses = analyze_embryo_batch(image_bytes_list, meta)
    return responses


@app.get("/api/v1/risk-indicators", response_model=List[RiskIndicator])
async def list_risk_indicators() -> List[RiskIndicator]:
    """
    Useful for frontends to show possible risk flags in the UI.
    """
    return [
        RiskIndicator(code="fragmentation_high", label="High cytoplasmic fragmentation"),
        RiskIndicator(code="irregular_cleavage", label="Irregular cleavage pattern"),
        RiskIndicator(code="slow_development", label="Slow development vs expected timeline"),
        RiskIndicator(code="multi_nucleation", label="Multi-nucleation observed"),
    ]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

