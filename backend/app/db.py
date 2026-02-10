import os
from pathlib import Path
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection


# Load .env that lives next to this file (app/.env) so it works
# regardless of the current working directory.
env_path = Path(__file__).with_name(".env")
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=False)
else:
    # Fallback: try default .env discovery in the working directory
    load_dotenv(override=False)

MONGO_URI = os.getenv("MONGODB_URI")

client: Optional[MongoClient] = None
analyses: Optional[Collection] = None

if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI)
        db = client["embryo_xai"]  # logical DB name
        analyses = db["analyses"]  # collection for analysis results
    except Exception:
        # If Mongo is misconfigured or unreachable, we fall back gracefully.
        client = None
        analyses = None


def save_analysis_document(doc: Dict[str, Any]) -> None:
    """
    Insert a single analysis document into MongoDB.

    This is a best-effort helper: if MongoDB is not configured or not
    reachable, it will silently no-op so the API still works.
    """
    if analyses is None:
        return

    try:
        analyses.insert_one(doc)
    except Exception:
        # Intentionally swallow errors to avoid breaking API responses.
        return