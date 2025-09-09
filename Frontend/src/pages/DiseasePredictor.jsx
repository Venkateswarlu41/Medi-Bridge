import React, { useState } from "react";
import styled from "styled-components";
import { predictDisease } from "../services/ml.service";
import { Stethoscope } from "lucide-react";

const PageContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Form = styled.form`
  margin-top: 32px;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 18px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 18px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  &:disabled {
    background: #b3c6e0;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.div`
  margin-top: 32px;
  background: #f7fafc;
  border-radius: 10px;
  padding: 18px;
  color: #2d3748;
  font-size: 1rem;
`;

const diseaseOptions = [
  { value: "brain_tumor", label: "Brain Tumor" },
  { value: "bone_fracture", label: "Bone Fracture" },
  { value: "breast_cancer", label: "Breast Cancer" },
  { value: "pneumonia", label: "Pneumonia" },
  { value: "anemia", label: "Anemia" },
  { value: "skin_cancer", label: "Skin Cancer" },
];

const DiseasePredictorPage = () => {
  const [disease, setDisease] = useState("brain_tumor");
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
    <PageContainer>
      <Title>
        <Stethoscope size={32} /> Disease Predictor
      </Title>
      <Form onSubmit={handleSubmit}>
        <Label>Disease:</Label>
        <Select value={disease} onChange={(e) => setDisease(e.target.value)}>
          {diseaseOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Label>Upload Image:</Label>
        <Input type="file" accept="image/*" onChange={handleImageChange} />
        <Button type="submit" disabled={loading || !image}>
          {loading ? "Predicting..." : "Predict"}
        </Button>
      </Form>
      {result && (
        <ResultBox>
          <strong>Result:</strong>
          {result.error ? (
            <span style={{ color: "#e53e3e" }}> {result.error}</span>
          ) : (
            <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
          )}
        </ResultBox>
      )}
    </PageContainer>
  );
};

export default DiseasePredictorPage;
