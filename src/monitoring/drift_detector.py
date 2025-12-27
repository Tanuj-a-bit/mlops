from evidently import Report
from evidently.presets import DataDriftPreset, DataSummaryPreset
import pandas as pd
import os
import pickle

class DriftDetector:
    """
    Detects data and prediction drift using Evidently AI.
    """
    
    def __init__(self, report_dir="monitoring/evidently_reports", model_path="models/als_model.pkl"):
        self.report_dir = report_dir
        self.model_path = model_path
        os.makedirs(report_dir, exist_ok=True)
        self.model = self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, "rb") as f:
                    return pickle.load(f)
            except Exception as e:
                print(f"Error loading model: {e}")
        return None

    def run_drift_analysis(self, reference_df, current_df, filename="drift_report.html"):
        """
        Runs Evidently drift analysis and saves the HTML report.
        """
        metrics = [
            DataDriftPreset(), 
            DataSummaryPreset()
        ]

        # Prepare data (Evidently can handle columns automatically)
        # We ensure weights are included as a feature and potential target
        report = Report(metrics=metrics)
        result = report.run(reference_data=reference_df, current_data=current_df)
        
        report_path = os.path.join(self.report_dir, filename)
        result.save_html(report_path)
        print(f"Drift report generated at: {report_path}")
        
        return result.dict()

if __name__ == "__main__":
    # Path to the processed data
    data_path = "data/processed/interactions.parquet"
    
    if os.path.exists(data_path):
        print(f"Loading real data from {data_path}...")
        df = pd.read_parquet(data_path)
        
        # Split data into Reference (first 80%) and Current (last 20%) to simulate time-based drift
        split_idx = int(len(df) * 0.8)
        ref_df = df.iloc[:split_idx]
        curr_df = df.iloc[split_idx:]
        
        print(f"Reference set size: {len(ref_df)}")
        print(f"Current set size: {len(curr_df)}")
        
        detector = DriftDetector()
        detector.run_drift_analysis(ref_df, curr_df)
    else:
        print(f"Error: {data_path} not found. Please run 'uv run dvc repro' first.")
