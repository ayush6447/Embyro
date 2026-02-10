from typing import List, Optional
from pydantic import BaseModel, Field


class RiskIndicator(BaseModel):
    code: str = Field(..., description="Machine-readable risk code")
    label: str = Field(..., description="Human-readable risk description")


class HeatmapExplanation(BaseModel):
    width: int = Field(..., description="Heatmap width in pixels")
    height: int = Field(..., description="Heatmap height in pixels")
    # 2D matrix of float intensities in [0, 1], flattened row-major.
    values: List[float] = Field(
        ..., description="Flattened heatmap values, length = width * height"
    )


class EmbryoAnalysisResponse(BaseModel):
    embryo_id: str = Field(..., description="Internal embryo identifier for this analysis")
    quality_score: float = Field(..., ge=0, le=100, description="Embryo quality score (0-100)")
    implantation_success_probability: float = Field(
        ..., ge=0, le=1, description="Predicted implantation probability (0-1)"
    )
    risk_indicators: List[RiskIndicator] = Field(
        default_factory=list, description="List of risk indicators"
    )
    explanation_heatmap: HeatmapExplanation = Field(
        ..., description="Explainable AI heatmap (currently random placeholder)"
    )
    notes: Optional[str] = Field(
        None, description="Free-form notes or explanation text for clinicians"
    )

