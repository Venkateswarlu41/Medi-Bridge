import React, { useState } from "react";
import { predictDisease } from "../services/ml.service";
import styled from "styled-components";

const diseaseOptions = [
  { value: "bone_fracture", label: "Bone Fracture" },
  { value: "brain_tumor", label: "Brain Tumor" },
  { value: "breast_cancer", label: "Breast Cancer" },
  { value: "pneumonia", label: "Pneumonia" },
];

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
`;

const Button = styled.button`
  background: #4299e1;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: #3182ce;
  }
`;

const ResultContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
`;

const Prediction = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.isPositive ? '#e53e3e' : '#38a169'};
`;

const Confidence = styled.div`
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
`;

const ImagePreview = styled.div`
  margin-top: 16px;
  img {
    max-width: 100%;
    border-radius: 8px;
  }
`;

const DiseasePredictor = () => {
  const [disease, setDisease] = useState("brain_tumor");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    
    setLoading(true);
    try {
      const res = await predictDisease(disease, image);
      setResult(res);
    } catch (error) {
      console.error("Prediction error:", error);
      setResult({ error: "Failed to process image. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>Disease Prediction</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Select Disease Type:</Label>
          <Select value={disease} onChange={(e) => setDisease(e.target.value)}>
            {diseaseOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Upload Medical Image:</Label>
          <FileInput 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
          />
          {imagePreview && (
            <ImagePreview>
              <img src={imagePreview} alt="Preview" />
            </ImagePreview>
          )}
        </FormGroup>

        <Button type="submit" disabled={loading || !image}>
          {loading ? "Analyzing Image..." : "Analyze"}
        </Button>
      </Form>

      {result && (
        <ResultContainer>
          {result.error ? (
            <div style={{ color: '#e53e3e' }}>{result.error}</div>
          ) : (
            <>
              <ResultHeader>
                <div>
                  <Prediction isPositive={result.is_disease_present}>
                    {result.prediction}
                  </Prediction>
                  <Confidence>
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </Confidence>
                </div>
                <div style={{ 
                  padding: '8px 16px',
                  background: result.is_disease_present ? '#FED7D7' : '#C6F6D5',
                  color: result.is_disease_present ? '#E53E3E' : '#38A169',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {result.is_disease_present ? 'Detected' : 'Not Detected'}
                </div>
              </ResultHeader>

              {/* Add more specific details based on disease type */}
              {disease === 'breast_cancer' && (
                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  <p><strong>Result Details:</strong></p>
                  <ul style={{ marginTop: '8px' }}>
                    <li>Classification: {result.prediction}</li>
                    <li>Confidence Level: {(result.confidence * 100).toFixed(2)}%</li>
                    {result.is_disease_present && (
                      <li style={{ color: '#e53e3e', marginTop: '8px' }}>
                        Please consult with a healthcare professional for further evaluation.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </ResultContainer>
      )}
    </Container>
  );
};
};

};

export default DiseasePredictor;
