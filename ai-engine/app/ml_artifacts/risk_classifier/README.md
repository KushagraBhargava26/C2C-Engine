# Risk Classifier Artifacts

Trained: 2026-07-04
Training samples: 5960
Source data: benstaf/FNSPID-filtered-nasdaq-100 (HuggingFace), CC BY-NC-4.0 (non-commercial)
Labels: proxy-derived from forward 5-day realized volatility, quantile-bucketed
Quantile cutoffs: LOW/MEDIUM=0.0111, MEDIUM/HIGH=0.0161, HIGH/CRITICAL=0.0218

## Files
- risk_classifier.joblib -- sklearn LogisticRegression, predicts risk bucket from a FinBERT CLS embedding
- feature_scaler.joblib -- StandardScaler, apply BEFORE calling risk_classifier.predict()
- label_encoder.joblib -- maps predicted class indices back to LOW/MEDIUM/HIGH/CRITICAL strings

## Known limitations (say these out loud if asked)
- Labels are a market-volatility proxy, not verified ground-truth risk
- Trained on US company stock news; applied at inference to geopolitical incident text (domain shift)
- Nasdaq-100 source skews toward Tech; other CONTRACT.md sectors are underrepresented in training
