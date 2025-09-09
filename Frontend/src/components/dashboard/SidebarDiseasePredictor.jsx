import React, { useState } from "react";
import { predictDisease } from "../../services/ml.service";

const diseaseOptions = [
  { value: "bone_fracture", label: "Bone Fracture" },
  { value: "brain_tumor", label: "Brain Tumor" },
  { value: "breast_cancer", label: "Breast Cancer" },
  { value: "pneumonia", label: "Pneumonia" },
];

const SidebarDiseasePredictor = ({ onClose }) => {
  const [disease, setDisease] = useState("bone_fracture");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    const res = await predictDisease(disease, image);
    setResult(res);
    setLoading(false);
  };

  return (
    <div
      style={{
        width: 350,
        padding: 24,
        background: "#fff",
        height: "100%",
        boxShadow: "0 0 16px #0001",
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "none",
          border: "none",
          fontSize: 22,
          cursor: "pointer",
        }}
      >
        &times;
      </button>
      <h2 style={{ marginTop: 0 }}>Disease Predictor</h2>
      <form onSubmit={handleSubmit}>
        <label>Disease:</label>
        <select
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
        >
          {diseaseOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <label>Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ width: "100%", marginBottom: 12 }}
        />
        <button
          type="submit"
          disabled={loading || !image}
          style={{
            width: "100%",
            padding: 8,
            background: "#0078d4",
            color: "#fff",
            border: "none",
            borderRadius: 4,
          }}
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: 20 }}>
          <h4>Result:</h4>
          {result.error ? (
            <span style={{ color: "red" }}>{result.error}</span>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default SidebarDiseasePredictor;
