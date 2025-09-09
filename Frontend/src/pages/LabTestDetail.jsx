import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "react-feather";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import labTestService from "../services/labTest.service";

const SmallButton = styled(motion.button)`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  &:hover {
    background: #f56565;
    color: white;
    transform: scale(1.05);
  }
`;

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DetailCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;

  h2 {
    color: #2d3748;
  }

  h3 {
    color: #2d3748;
  }

  strong {
    color: #2d3748;
    font-weight: 600;
  }

  .info-section {
    background: #f7fafc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .info-item {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    text-transform: capitalize;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ResultsSection = styled.section`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    border-color: #4299e1;
    outline: none;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  &:focus {
    border-color: #4299e1;
    outline: none;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  &:focus {
    border-color: #4299e1;
    outline: none;
  }
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
`;

const ResultInfo = styled.div`
  flex: 1;
`;

const ResultName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const ResultDetails = styled.div`
  font-size: 14px;
  color: #4a5568;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  background: ${(props) => {
    switch (props.className) {
      case "primary":
        return "#4299e1";
      case "success":
        return "#48bb78";
      case "danger":
        return "#f56565";
      case "secondary":
      default:
        return "#edf2f7";
    }
  }};
  color: ${(props) => (props.className === "secondary" ? "#4a5568" : "white")};
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  background: #edf2f7;
  color: #4a5568;
  margin-bottom: 20px;
  cursor: pointer;
`;

function LabTestDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, hasAnyRole: checkRole } = useAuth();
  const [labTest, setLabTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newResult, setNewResult] = useState({
    parameter: "",
    value: "",
    unit: "",
    status: "normal",
    normalRange: "",
  });
  const [results, setResults] = useState([]);
  const [interpretation, setInterpretation] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewAction, setReviewAction] = useState("");

  const handleAddResult = () => {
    if (!newResult.parameter || !newResult.value) {
      toast.error("Parameter and value are required");
      return;
    }
    setResults([...results, { ...newResult }]);
    setNewResult({
      parameter: "",
      value: "",
      unit: "",
      status: "normal",
      normalRange: "",
    });
  };

  const handleRemoveResult = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleSubmitResults = async () => {
    setUpdating(true);
    try {
      // Validate required fields
      if (labTest?.testType?.toLowerCase().includes("imaging")) {
        if (!newResult.image) {
          toast.error("Please upload an image");
          return;
        }
        if (!interpretation) {
          toast.error("Please provide interpretation");
          return;
        }
      } else {
        if (results.length === 0) {
          toast.error("Please add at least one result");
          return;
        }
      }

      if (!conclusion) {
        toast.error("Please provide a conclusion");
        return;
      }

      if (!recommendations) {
        toast.error("Please provide recommendations");
        return;
      }

      // Create FormData for image upload
      let formData = new FormData();

      if (labTest?.testType?.toLowerCase().includes("imaging")) {
        formData.append("image", newResult.image);
        formData.append("interpretation", interpretation);
        formData.append("conclusion", conclusion);
        formData.append("recommendations", recommendations);
      } else {
        // For regular tests
        formData = {
          results,
          interpretation,
          conclusion,
          recommendations,
        };
      }

      console.log("Submitting results with data:", formData);

      const result = await labTestService.uploadLabResults(
        labTest._id,
        formData
      );

      console.log("Upload result:", result);

      if (result.success) {
        // Update test status to completed
        const statusResult = await labTestService.updateLabTestStatus(
          labTest._id,
          "completed"
        );

        if (statusResult.success) {
          toast.success("Results submitted successfully");
          navigate("/lab-tests");
        } else {
          console.error("Status update error:", statusResult);
          toast.error(statusResult.message || "Failed to update test status");
        }
      } else {
        console.error("Upload error:", result);
        toast.error(result.message || "Failed to submit results");
      }
    } catch (error) {
      console.error("Submit results error:", error);
      toast.error(error.response?.data?.message || "Failed to submit results");
    } finally {
      setUpdating(false);
    }
  };

  // Effect for fetching lab test data
  useEffect(() => {
    if (id) {
      fetchLabTestDetail();
    }
  }, [id]);

  const fetchLabTestDetail = async () => {
    try {
      setLoading(true);

      // Check if user has appropriate role
      if (!checkRole(["admin", "doctor", "lab_technician", "patient"])) {
        toast.error("You don't have permission to view lab test details");
        navigate("/lab-tests");
        return;
      }

      console.log("Fetching lab test details for ID:", id);
      const response = await labTestService.getLabTestById(id);
      console.log("Lab test API response:", response);

      // Add detailed logging
      console.log("Full API response:", {
        success: response.success,
        data: response.data,
        message: response.message,
      });

      if (response.success && response.data && response.data.labTest) {
        // For lab technicians, check if they're assigned to this test
        if (
          user.role === "lab_technician" &&
          response.data.labTest.assignedTechnician &&
          response.data.labTest.assignedTechnician._id !== user._id &&
          response.data.labTest.status !== "requested"
        ) {
          toast.error("You can only view lab tests assigned to you");
          navigate("/lab-tests");
          return;
        }

        console.log("Setting lab test data:", response.data.labTest);
        setLabTest(response.data.labTest);

        // Set test results if available
        if (response.data.results && Array.isArray(response.data.results)) {
          setResults(response.data.results);
        } else if (response.data.results) {
          // If results exist but not as an array, handle as single result
          setResults([response.data.results]);
        } else {
          setResults([]);
        }

        // Update other fields if they exist
        setInterpretation(response.data.interpretation || "");
        setConclusion(response.data.conclusion || "");
        setRecommendations(response.data.recommendations || "");

        // Log success
        console.log("Successfully loaded lab test data");
      } else {
        console.error("Failed to load lab test:", {
          response,
          success: response.success,
          message: response.message,
        });
        toast.error(response.message || "Failed to load lab test details");
        navigate("/lab-tests");
      }
    } catch (error) {
      console.error("Fetch lab test error:", error);
      if (error.response?.status === 403) {
        toast.error("You don't have permission to view this lab test");
      } else {
        toast.error("Failed to load lab test details. Please try again.");
      }
      navigate("/lab-tests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            color: "#718096",
            fontSize: "16px",
          }}
        >
          Loading lab test details...
        </div>
      </PageContainer>
    );
  }

  const handleStartTest = async () => {
    try {
      const result = await labTestService.updateLabTestStatus(
        labTest._id,
        "in-progress"
      );
      if (result.success) {
        toast.success("Test started successfully");
        await fetchLabTestDetail(); // Refresh the data
      } else {
        toast.error(result.message || "Failed to start test");
      }
    } catch (error) {
      console.error("Start test error:", error);
      toast.error("Failed to start test");
    }
  };

  return (
    <>
      <PageContainer>
        <BackButton
          onClick={() => navigate("/lab-tests")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} />
          Back to Lab Tests
        </BackButton>

        <DetailCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: "32px" }}>
            {/* Patient Info Section */}
            <div
              style={{
                background: "#f7fafc",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    {labTest?.patient?.firstName} {labTest?.patient?.lastName}
                  </h2>
                  <div style={{ color: "#4a5568", marginBottom: "4px" }}>
                    <strong>Age:</strong>{" "}
                    {labTest?.patient?.dateOfBirth
                      ? Math.floor(
                          (new Date() - new Date(labTest.patient.dateOfBirth)) /
                            31557600000
                        )
                      : "N/A"}{" "}
                    years
                  </div>
                  <div style={{ color: "#4a5568", marginBottom: "4px" }}>
                    <strong>Gender:</strong> {labTest?.patient?.gender || "N/A"}
                  </div>
                  <div style={{ color: "#4a5568" }}>
                    <strong>Contact:</strong> {labTest?.patient?.phone || "N/A"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        backgroundColor:
                          labTest?.status === "completed"
                            ? "#48bb78"
                            : labTest?.status === "in-progress"
                            ? "#ed8936"
                            : labTest?.status === "assigned"
                            ? "#4299e1"
                            : "#718096",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {labTest?.status}
                    </span>
                  </div>
                  <div style={{ color: "#4a5568", marginBottom: "4px" }}>
                    <strong>Test ID:</strong> {labTest?.testId}
                  </div>
                  <div style={{ color: "#4a5568" }}>
                    <strong>Date:</strong>{" "}
                    {labTest?.requestDate
                      ? new Date(labTest.requestDate).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Test Details Section */}
            <div
              style={{
                background: "#f7fafc",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#2d3748",
                }}
              >
                Test Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                }}
              >
                <div>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Test Type:</strong>{" "}
                    <span style={{ color: "#4a5568" }}>
                      {labTest?.testType}
                    </span>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Department:</strong>{" "}
                    <span style={{ color: "#4a5568" }}>
                      {labTest?.department?.name}
                    </span>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Priority:</strong>{" "}
                    <span
                      style={{
                        color:
                          labTest?.priority === "urgent"
                            ? "#e53e3e"
                            : labTest?.priority === "high"
                            ? "#dd6b20"
                            : "#38a169",
                        textTransform: "capitalize",
                      }}
                    >
                      {labTest?.priority || "Normal"}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Requesting Doctor:</strong>{" "}
                    <span style={{ color: "#4a5568" }}>
                      Dr. {labTest?.doctor?.firstName}{" "}
                      {labTest?.doctor?.lastName}
                    </span>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>Assigned Technician:</strong>{" "}
                    <span style={{ color: "#4a5568" }}>
                      {labTest?.assignedTechnician
                        ? `${labTest.assignedTechnician.firstName} ${labTest.assignedTechnician.lastName}`
                        : "Not assigned"}
                    </span>
                  </div>
                  {labTest?.specialInstructions && (
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Special Instructions:</strong>{" "}
                      <span style={{ color: "#4a5568" }}>
                        {labTest.specialInstructions}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Clinical Information */}
            {labTest?.clinicalIndication && (
              <div
                style={{
                  background: "#f7fafc",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "12px",
                    color: "#2d3748",
                  }}
                >
                  Clinical Information
                </h3>
                <div style={{ color: "#4a5568" }}>
                  <strong>Clinical Indication:</strong>{" "}
                  {labTest.clinicalIndication}
                </div>
              </div>
            )}
          </div>

          {/* Start Test Button for Lab Technicians */}
          {checkRole(["lab_technician"]) && labTest?.status === "assigned" && (
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <ActionButton
                className="primary"
                onClick={handleStartTest}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                Start Test
              </ActionButton>
            </div>
          )}

          {/* Results Section */}
          {checkRole(["lab_technician"]) &&
            labTest?.status === "in-progress" && (
              <ResultsSection>
                <SectionTitle>
                  <Upload size={20} />
                  Test Results
                </SectionTitle>

                {/* Parameter-based test form */}
                {!labTest?.testType?.toLowerCase().includes("imaging") && (
                  <>
                    <FormGroup>
                      <FormLabel>Parameter</FormLabel>
                      <FormInput
                        type="text"
                        value={newResult.parameter}
                        onChange={(e) =>
                          setNewResult({
                            ...newResult,
                            parameter: e.target.value,
                          })
                        }
                        placeholder="e.g., Hemoglobin"
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Value</FormLabel>
                      <FormInput
                        type="text"
                        value={newResult.value}
                        onChange={(e) =>
                          setNewResult({ ...newResult, value: e.target.value })
                        }
                        placeholder="e.g., 12.5"
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Unit</FormLabel>
                      <FormInput
                        type="text"
                        value={newResult.unit}
                        onChange={(e) =>
                          setNewResult({ ...newResult, unit: e.target.value })
                        }
                        placeholder="e.g., g/dL"
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Normal Range</FormLabel>
                      <FormInput
                        type="text"
                        value={newResult.normalRange}
                        onChange={(e) =>
                          setNewResult({
                            ...newResult,
                            normalRange: e.target.value,
                          })
                        }
                        placeholder="e.g., 12.0 - 16.0 g/dL"
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>Status</FormLabel>
                      <FormSelect
                        value={newResult.status}
                        onChange={(e) =>
                          setNewResult({ ...newResult, status: e.target.value })
                        }
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                        <option value="critical">Critical</option>
                      </FormSelect>
                    </FormGroup>

                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        marginBottom: "24px",
                      }}
                    >
                      <ActionButton
                        className="secondary"
                        onClick={handleAddResult}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus size={16} />
                        Add Result
                      </ActionButton>
                    </div>

                    {/* Display added results */}
                    {results.length > 0 && (
                      <ResultsList>
                        {results.map((result, index) => (
                          <ResultItem key={index}>
                            <ResultInfo>
                              <ResultName>{result.parameter}</ResultName>
                              <ResultDetails>
                                {result.value} {result.unit} (Normal Range:{" "}
                                {result.normalRange})
                                <div
                                  style={{
                                    marginTop: "4px",
                                    color:
                                      result.status === "normal"
                                        ? "#48bb78"
                                        : result.status === "abnormal"
                                        ? "#ed8936"
                                        : "#f56565",
                                  }}
                                >
                                  Status: {result.status}
                                </div>
                              </ResultDetails>
                            </ResultInfo>
                            <SmallButton
                              onClick={() => handleRemoveResult(index)}
                            >
                              <Trash2 size={14} />
                              Remove
                            </SmallButton>
                          </ResultItem>
                        ))}
                      </ResultsList>
                    )}
                  </>
                )}

                {/* Imaging test form */}
                {labTest?.testType?.toLowerCase().includes("imaging") && (
                  <>
                    <div
                      style={{
                        border: "2px dashed #e2e8f0",
                        borderRadius: "12px",
                        padding: "24px",
                        marginBottom: "24px",
                        background: "#f7fafc",
                      }}
                    >
                      <FormGroup>
                        <FormLabel
                          style={{ fontSize: "16px", marginBottom: "12px" }}
                        >
                          Upload Image Result
                        </FormLabel>
                        <div
                          style={{
                            textAlign: "center",
                            padding: newResult.image ? "0" : "40px",
                          }}
                        >
                          {newResult.image ? (
                            <div style={{ marginBottom: "16px" }}>
                              <img
                                src={URL.createObjectURL(newResult.image)}
                                alt="Selected"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "300px",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                }}
                              />
                              <div style={{ marginTop: "8px" }}>
                                <SmallButton
                                  onClick={() =>
                                    setNewResult({ ...newResult, image: null })
                                  }
                                  style={{ margin: "0 auto" }}
                                >
                                  <Trash2 size={14} />
                                  Remove Image
                                </SmallButton>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload
                                size={32}
                                color="#718096"
                                style={{ marginBottom: "12px" }}
                              />
                              <div
                                style={{
                                  marginBottom: "16px",
                                  color: "#4a5568",
                                }}
                              >
                                Click to upload or drag and drop
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    // Validate file size (e.g., max 5MB)
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast.error(
                                        "File size should be less than 5MB"
                                      );
                                      return;
                                    }
                                    setNewResult({
                                      ...newResult,
                                      image: file,
                                    });
                                  }
                                }}
                                style={{ display: "none" }}
                                id="image-upload"
                              />
                              <label htmlFor="image-upload">
                                <ActionButton
                                  as="span"
                                  className="secondary"
                                  style={{ cursor: "pointer" }}
                                >
                                  <Upload size={16} />
                                  Choose File
                                </ActionButton>
                              </label>
                            </>
                          )}
                        </div>
                      </FormGroup>
                    </div>

                    <FormGroup>
                      <FormLabel>Interpretation</FormLabel>
                      <FormTextarea
                        value={interpretation}
                        onChange={(e) => setInterpretation(e.target.value)}
                        placeholder="Describe your observations and findings from the image"
                        style={{ minHeight: "120px" }}
                      />
                    </FormGroup>
                  </>
                )}

                {/* Common form fields */}
                <FormGroup>
                  <FormLabel>Conclusion</FormLabel>
                  <FormTextarea
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    placeholder="Enter your conclusion"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>Recommendations</FormLabel>
                  <FormTextarea
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Enter any recommendations"
                  />
                </FormGroup>

                <ActionButton
                  className="success"
                  onClick={handleSubmitResults}
                  disabled={updating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={16} />
                  {updating ? "Submitting..." : "Submit Results"}
                </ActionButton>
              </ResultsSection>
            )}

          {/* Completed test results display */}
          {labTest?.status === "completed" && (
            <ResultsSection>
              <SectionTitle>
                <CheckCircle size={20} color="#48bb78" />
                Test Results
              </SectionTitle>

              {/* Parameter Results */}
              {labTest.results &&
                Array.isArray(labTest.results) &&
                labTest.results.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <FormLabel>Parameters</FormLabel>
                    <ResultsList>
                      {labTest.results.map((result, index) => (
                        <ResultItem key={index}>
                          <ResultInfo>
                            <ResultName>{result.parameter}</ResultName>
                            <ResultDetails>
                              <strong>Value:</strong> {result.value}{" "}
                              {result.unit}
                              {result.normalRange && (
                                <div>
                                  <strong>Normal Range:</strong>{" "}
                                  {result.normalRange}
                                </div>
                              )}
                              <div
                                style={{
                                  marginTop: "4px",
                                  color:
                                    result.status === "normal"
                                      ? "#48bb78"
                                      : result.status === "abnormal"
                                      ? "#ed8936"
                                      : "#f56565",
                                  fontWeight: "600",
                                }}
                              >
                                Status: {result.status}
                              </div>
                            </ResultDetails>
                          </ResultInfo>
                        </ResultItem>
                      ))}
                    </ResultsList>
                  </div>
                )}

              {/* Image Results */}
              {labTest.results?.imageUrl && (
                <FormGroup>
                  <FormLabel>Test Image</FormLabel>
                  <div style={{ margin: "10px 0" }}>
                    <img
                      src={labTest.results.imageUrl}
                      alt="Test Result"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </div>
                </FormGroup>
              )}

              {/* Interpretation */}
              {(labTest.results?.interpretation || labTest.interpretation) && (
                <FormGroup>
                  <FormLabel>Interpretation</FormLabel>
                  <div
                    style={{
                      padding: "12px",
                      background: "#f7fafc",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      lineHeight: "1.6",
                    }}
                  >
                    {labTest.results?.interpretation || labTest.interpretation}
                  </div>
                </FormGroup>
              )}

              {/* Conclusion */}
              {(labTest.results?.conclusion || labTest.conclusion) && (
                <FormGroup>
                  <FormLabel>Conclusion</FormLabel>
                  <div
                    style={{
                      padding: "12px",
                      background: "#f7fafc",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      lineHeight: "1.6",
                    }}
                  >
                    {labTest.results?.conclusion || labTest.conclusion}
                  </div>
                </FormGroup>
              )}

              {/* Recommendations */}
              {(labTest.results?.recommendations ||
                labTest.recommendations) && (
                <FormGroup>
                  <FormLabel>Recommendations</FormLabel>
                  <div
                    style={{
                      padding: "12px",
                      background: "#f7fafc",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      lineHeight: "1.6",
                    }}
                  >
                    {labTest.results?.recommendations ||
                      labTest.recommendations}
                  </div>
                </FormGroup>
              )}

              {/* Completion Info */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "12px",
                  background: "#f0fff4",
                  border: "2px solid #48bb78",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <strong>Completed By:</strong>{" "}
                  {labTest.assignedTechnician?.firstName}{" "}
                  {labTest.assignedTechnician?.lastName}
                </div>
                <div>
                  <strong>Completed On:</strong>{" "}
                  {new Date(labTest.completedDate).toLocaleString()}
                </div>
              </div>
            </ResultsSection>
          )}

          {/* Doctor review section */}
          {checkRole(["doctor"]) && labTest?.status === "completed" && (
            <ResultsSection>
              <SectionTitle>
                <CheckCircle size={20} />
                Doctor Review
              </SectionTitle>

              {!labTest.doctorReview?.reviewed && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#718096",
                    background: "white",
                    borderRadius: "12px",
                    border: "2px dashed #e2e8f0",
                  }}
                >
                  <AlertTriangle
                    size={32}
                    color="#ed8936"
                    style={{ marginBottom: "10px" }}
                  />
                  <div style={{ marginBottom: "15px" }}>
                    This test is ready for review
                  </div>
                  <ActionButton
                    className="primary"
                    onClick={() => setShowReviewForm(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle size={16} />
                    Start Review
                  </ActionButton>
                </div>
              )}
            </ResultsSection>
          )}
        </DetailCard>
      </PageContainer>
    </>
  );
}

export default LabTestDetail;
