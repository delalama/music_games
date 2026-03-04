import os

from flask import Flask, jsonify, render_template, request


def create_app() -> Flask:
    app = Flask(__name__)

    def get_solfeo_results_summary() -> dict:
        return {
            "overall": {
                "attempts": 0,
                "correct": 0,
                "accuracy_pct": 0.0,
            },
            "by_exercise": [],
        }

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/healthz")
    def healthz():
        return jsonify({"ok": True})

    @app.post("/solfeo/result")
    def solfeo_result():
        payload = request.get_json(silent=True) or {}
        exercise_id = str(payload.get("exercise_id", "")).strip()

        if not exercise_id:
            return jsonify({"ok": False, "error": "exercise_id is required"}), 400

        # Intentionally a no-op: this project does not persist user results.
        return jsonify({"ok": True})

    @app.get("/solfeo/stats")
    def solfeo_stats():
        return jsonify({"ok": True, "summary": get_solfeo_results_summary()})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))