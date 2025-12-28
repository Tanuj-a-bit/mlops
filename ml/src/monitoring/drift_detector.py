from evidently import Report
from evidently.presets import DataDriftPreset, DataSummaryPreset
from evidently.metrics import DatasetMissingValueCount, DriftedColumnsCount, ValueDrift
import pandas as pd
import os
import pickle

class DriftDetector:
    """
    Detects data and prediction drift using Evidently AI.
    Tracks: Feature drift (KS statistic, PSI), Null/missing rates, Mean/std shifts.
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
        Includes: Feature shift, PSI, KS tests, Null rates, Mean/std shifts.
        """
        # Create a comprehensive Report with presets and additional metrics
        metrics = [
            DataDriftPreset(),              # Comprehensive drift detection (KS statistic, PSI)
            DataSummaryPreset(),            # Dataset statistics (mean, std, etc.)
            DatasetMissingValueCount(),     # Missing value tracking
            DriftedColumnsCount(),          # Count of drifted columns
            ValueDrift(column="visitorid"),
            ValueDrift(column="itemid"),
            ValueDrift(column="weight"),
        ]

        
        report = Report(metrics=metrics)
        snapshot = report.run(reference_data=reference_df, current_data=current_df)
        
        report_path = os.path.join(self.report_dir, filename)
        snapshot.save_html(report_path)
        print(f"✓ Drift report generated at: {report_path}")
        
        # Extract and print key metrics
        result = snapshot.dict()
        print("\n--- Drift Analysis Summary ---")
        
        # Check if dataset drift is detected
        if 'metrics' in result:
            for metric in result['metrics']:
                metric_type = metric.get('metric', '')
                
                if 'DriftedColumnsCount' in metric_type:
                    drifted_count = metric.get('result', {}).get('number_of_drifted_columns', 0)
                    total_columns = metric.get('result', {}).get('number_of_columns', 0)
                    if total_columns > 0:
                        drift_share = drifted_count / total_columns
                        print(f"Drifted Columns: {drifted_count}/{total_columns} ({drift_share:.2%})")
                
                if 'DatasetMissingValueCount' in metric_type:
                    missing_current = metric.get('result', {}).get('current', {}).get('number_of_missing_values', 0)
                    missing_ref = metric.get('result', {}).get('reference', {}).get('number_of_missing_values', 0)
                    print(f"Missing Values - Reference: {missing_ref}, Current: {missing_current}")
        
        return result


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