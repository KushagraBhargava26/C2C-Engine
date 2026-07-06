"""
One-time script to push c2c-brain's model artifacts to Hugging Face Hub.

Run once from your project root (same level as app/):
    python push_to_hub.py

Requires: pip install huggingface_hub
Requires you to have already run `huggingface-cli login` (or set the
HF_TOKEN env var) with a token that has "write" access to your repos.
"""

import os
from huggingface_hub import HfApi

REPO_ID = "Lakshya-Sahu47/c2c-finbert-risk"

FINBERT_DIR = "app/ml_artifacts/finbert_model"
RISK_DIR = "app/ml_artifacts/risk_classifier"

api = HfApi()

# Create the repo if it doesn't already exist (safe to re-run — no-op if it does)
api.create_repo(repo_id=REPO_ID, exist_ok=True)

# --- Push FinBERT files to repo root ---
if os.path.isdir(FINBERT_DIR):
    print(f"Uploading FinBERT files from {FINBERT_DIR} ...")
    api.upload_folder(
        folder_path=FINBERT_DIR,
        repo_id=REPO_ID,
        path_in_repo=".",
    )
    print("FinBERT upload complete.")
else:
    print(f"Skipped: {FINBERT_DIR} not found.")

# --- Push risk classifier artifacts into a risk_classifier/ subfolder ---
if os.path.isdir(RISK_DIR):
    print(f"Uploading risk classifier artifacts from {RISK_DIR} ...")
    api.upload_folder(
        folder_path=RISK_DIR,
        repo_id=REPO_ID,
        path_in_repo="risk_classifier",
    )
    print("Risk classifier upload complete.")
else:
    print(f"Skipped: {RISK_DIR} not found.")

print(f"\nDone. Check: https://huggingface.co/{REPO_ID}")