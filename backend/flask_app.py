from flask import Flask, jsonify, request
from werkzeug.utils import secure_filename
from typing import Any, Dict, List

from app.services.analysis import analyze_embryo_batch


def create_flask_app() -> Flask:
    """
    Minimal Flask wrapper around the same analysis service used by FastAPI.

    This is mainly to demonstrate the Flask part of the tech stack.
    In production you would typically choose either FastAPI or Flask,
    not both, or use Flask only for legacy integration.
    """
    app = Flask(__name__)

    @app.get("/flask/health")
    def health() -> Any:
        return jsonify({"status": "ok", "service": "embryo-xai-flask"})

    @app.post("/flask/analyze")
    def analyze() -> Any:
        if "files" not in request.files:
            return jsonify({"error": "No files uploaded under 'files' field"}), 400

        # `files` may be a single file or multiple with same key
        uploaded_files = request.files.getlist("files")
        if not uploaded_files:
            return jsonify({"error": "At least one file is required"}), 400

        image_bytes_list: List[bytes] = []
        for f in uploaded_files:
            f.filename = secure_filename(f.filename)
            content = f.read()
            if not content:
                return jsonify({"error": f"File {f.filename} is empty"}), 400
            image_bytes_list.append(content)

        meta: Dict[str, Any] = {
            "maternal_age": request.form.get("maternal_age", type=int),
            "fertilization_method": request.form.get("fertilization_method"),
        }

        results = analyze_embryo_batch(image_bytes_list, meta)
        # Pydantic models -> dicts for JSON
        return jsonify([r.model_dump() for r in results])

    return app


if __name__ == "__main__":
    app = create_flask_app()
    app.run(host="0.0.0.0", port=5000, debug=True)

