"""
prepare_data.py — Python equivalent of prepare-data.ts

Merges 4 source CSVs into public/data/firms.json for the Next.js frontend.

Usage:
    python scripts/prepare_data.py

Source files expected at SRC (edit the path below if needed):
    data/processed/test_features.csv
    data/processed/challenge1_test_predictions.csv
    data/processed/challenge1_test_risk_scores.csv
    test_features_enhanced.csv

Output:
    public/data/firms.json  (relative to this script's parent directory)
"""

import json
import math
import os
import sys

import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────────

SRC = os.path.expanduser("~/Desktop/slides with claude code")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SCRIPT_DIR, "..", "public", "data", "firms.json")

# ── Sector map ─────────────────────────────────────────────────────────────────

SECTORS = {
    10: "Food manufacturing",
    25: "Metal products",
    41: "Building construction",
    43: "Specialised construction",
    45: "Motor trade & repair",
    46: "Wholesale trade",
    47: "Retail trade",
    56: "Restaurants & catering",
    62: "Software & IT",
    68: "Real estate",
    71: "Architecture & engineering",
    77: "Rental & leasing",
    82: "Business support services",
}

# ── Helpers ────────────────────────────────────────────────────────────────────

NA_VALUES = {"", "NA", "NaN", "nan", "None"}


def to_float_or_none(val):
    if pd.isna(val) or str(val).strip() in NA_VALUES:
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def to_int_or_zero(val):
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return 0


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Reading source files…")

    features   = pd.read_csv(os.path.join(SRC, "data/processed/test_features.csv"),   dtype=str, keep_default_na=False)
    predictions = pd.read_csv(os.path.join(SRC, "data/processed/challenge1_test_predictions.csv"), dtype=str, keep_default_na=False)
    enhanced   = pd.read_csv(os.path.join(SRC, "test_features_enhanced.csv"),          dtype=str, keep_default_na=False)
    risk_scores = pd.read_csv(os.path.join(SRC, "data/processed/challenge1_test_risk_scores.csv"), dtype=str, keep_default_na=False)

    for name, df in [("features", features), ("predictions", predictions),
                     ("enhanced", enhanced), ("risk scores", risk_scores)]:
        print(f"  {name}: {len(df)} rows")

    # Strip whitespace from all column names and string values
    for df in [features, predictions, enhanced, risk_scores]:
        df.columns = df.columns.str.strip()
        for col in df.select_dtypes(include="object").columns:
            df[col] = df[col].str.strip()

    # Merge on (company_id, fiscal_year)
    df = features.merge(predictions, on=["company_id", "fiscal_year"], how="left", suffixes=("", "_pred"))
    df = df.merge(enhanced,    on=["company_id", "fiscal_year"], how="left", suffixes=("", "_enh"))
    df = df.merge(risk_scores, on=["company_id", "fiscal_year"], how="left", suffixes=("", "_risk"))

    firms = []
    for _, row in df.iterrows():
        prob = to_float_or_none(row.get("bankruptcy_probability", "")) or 0.0
        sector_raw = row.get("ateco_sector", "").strip()
        sector_int = to_int_or_zero(sector_raw)
        sector_label = SECTORS.get(sector_int, sector_raw)

        risk_score_raw = to_float_or_none(row.get("risk_score_0_100", ""))
        risk_score = risk_score_raw if risk_score_raw is not None else round(prob * 100, 2)

        firm = {
            "company_id":            row.get("company_id", "").strip(),
            "fiscal_year":           to_int_or_zero(row.get("fiscal_year", "")),
            "province":              row.get("province", "").strip(),
            "region":                row.get("region", "").strip(),
            "ateco_sector":          sector_int,
            "sector_label":          sector_label,
            "legal_form":            row.get("legal_form", "").strip(),
            "years_in_business":     to_float_or_none(row.get("years_in_business", "")),
            "total_assets":          to_float_or_none(row.get("total_assets", "")),
            "roi":                   to_float_or_none(row.get("roi", "")),
            "roe":                   to_float_or_none(row.get("roe", "")),
            "leverage":              to_float_or_none(row.get("leverage", "")),
            "current_ratio":         to_float_or_none(row.get("current_ratio", "")),
            "debt_to_assets":        to_float_or_none(row.get("debt_to_assets", "")),
            "profit_margin":         to_float_or_none(row.get("profit_margin", "")),
            # engineered
            "altman_z_like_score":       to_float_or_none(row.get("altman_z_like_score", "")),
            "profit_margin_vs_sector":   to_float_or_none(row.get("profit_margin_vs_sector", "")),
            "leverage_vs_sector":        to_float_or_none(row.get("leverage_vs_sector", "")),
            "roi_vs_sector":             to_float_or_none(row.get("roi_vs_sector", "")),
            "debt_to_assets_slope":      to_float_or_none(row.get("debt_to_assets_slope", "")),
            "current_ratio_slope":       to_float_or_none(row.get("current_ratio_slope", "")),
            "neg_margin_streak":         to_float_or_none(row.get("neg_margin_streak", "")),
            # prediction
            "bankruptcy_probability":    prob,
            "bankruptcy_predicted":      to_int_or_zero(row.get("bankruptcy_predicted", "0")),
            "risk_score_0_100":          risk_score,
            "risk_decile":               row.get("risk_decile", "D1").strip() or "D1",
            "risk_tier":                 row.get("risk_tier", "Very Low").strip() or "Very Low",
        }
        firms.append(firm)

    # Sort: highest probability first
    firms.sort(key=lambda f: f["bankruptcy_probability"], reverse=True)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump(firms, fh, allow_nan=False)

    size_kb = os.path.getsize(OUT) / 1024
    print(f"\nWrote {len(firms)} firms → {OUT}")
    print(f"File size: {size_kb:.0f} KB")

    tiers = ["Very Low", "Low", "Moderate", "Elevated", "High", "Very High"]
    for t in tiers:
        count = sum(1 for f in firms if f["risk_tier"] == t)
        print(f"  {t}: {count}")

    flagged = sum(1 for f in firms if f["bankruptcy_predicted"] == 1)
    print(f"\nFlagged at default threshold (0.109): {flagged} ({flagged/len(firms)*100:.2f}%)")


if __name__ == "__main__":
    main()
