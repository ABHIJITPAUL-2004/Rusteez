import cv2
import numpy as np


class HSVRustDetector:
    """HSV-based rust detection for railway images."""

    RUST_RANGES = [
        (np.array([0, 50, 50]),   np.array([20, 255, 255])),   # Orange-red rust
        (np.array([160, 50, 50]), np.array([180, 255, 255])),   # Red rust
        (np.array([10, 40, 40]),  np.array([25, 255, 200])),    # Brown rust
    ]

    def detect(self, image_path: str = None, image_bytes: bytes = None) -> dict:
        if image_path:
            img = cv2.imread(image_path)
        elif image_bytes:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        else:
            raise ValueError("Provide image_path or image_bytes")

        if img is None:
            raise ValueError("Could not decode image")

        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        combined_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)

        for lower, upper in self.RUST_RANGES:
            mask = cv2.inRange(hsv, lower, upper)
            combined_mask = cv2.bitwise_or(combined_mask, mask)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
        combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)

        total_pixels = img.shape[0] * img.shape[1]
        rust_pixels = cv2.countNonZero(combined_mask)
        rust_percentage = (rust_pixels / total_pixels) * 100

        severity, confidence = self._classify(rust_percentage)

        contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        regions = len([c for c in contours if cv2.contourArea(c) > 100])

        return {
            "method": "HSV Color Detection",
            "rust_detected": rust_percentage >= 2,
            "severity": severity,
            "rust_percentage": round(rust_percentage, 2),
            "confidence": confidence,
            "rust_pixels": int(rust_pixels),
            "total_pixels": int(total_pixels),
            "rust_regions": regions,
            "description": f"Detected {round(rust_percentage, 1)}% rust-colored pixels across {regions} region(s) via HSV color analysis.",
            "recommendation": self._recommendation(severity),
        }

    def _classify(self, pct: float) -> tuple:
        if pct < 2:   return "none",     0.92
        if pct < 10:  return "low",      0.78
        if pct < 25:  return "medium",   0.82
        if pct < 50:  return "high",     0.87
        return            "critical",    0.91

    def _recommendation(self, severity: str) -> str:
        return {
            "none":     "No action needed. Continue routine monitoring.",
            "low":      "Monitor at next scheduled inspection. Document location.",
            "medium":   "Schedule maintenance within 30 days. Apply rust inhibitor.",
            "high":     "Urgent maintenance required within 7 days. Restrict speed.",
            "critical": "IMMEDIATE action required. Remove from service pending inspection.",
        }.get(severity, "Inspect further.")
