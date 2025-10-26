import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./pages/Home";
import Layout from "./components/layout/Layout";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import MedicalRecords from "./pages/MedicalRecords";
import Billing from "./pages/Billing";
import Pharmacy from "./pages/Pharmacy";
import AskAI from "./pages/AskAI";
import AppointmentDetail from "./pages/AppointmentDetail";
import AppointmentForm from "./components/appointments/AppointmentForm";
import DoctorForm from "./components/forms/DoctorForm";
import PatientForm from "./components/forms/PatientForm";
import DoctorProfile from "./pages/DoctorProfile";
import PatientProfile from "./pages/PatientProfile";
import MedicalRecordDetail from "./pages/MedicalRecordDetail";
import LabTests from "./pages/LabTests";
import LabTestDetail from "./pages/LabTestDetail";
import LabResults from "./pages/LabResults";
import LabTechnicians from "./pages/LabTechnicians";
import Prescriptions from "./pages/Prescriptions";
import PrescriptionForm from "./components/forms/PrescriptionForm";
import PrescriptionDetail from "./pages/PrescriptionDetail";
import LoadingSpinner from "./components/common/LoadingSpinner";
import DiseasePredictorPage from "./pages/DiseasePredictor";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Patients />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PatientProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PatientForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Appointments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AppointmentDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AppointmentForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Doctors />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DoctorProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DoctorForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MedicalRecords />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MedicalRecordDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Billing />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Pharmacy />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ask-ai"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AskAI />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-tests"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LabTests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-tests/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LabTestDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-technicians"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LabTechnicians />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-results"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LabResults />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/disease-predictor"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DiseasePredictorPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Prescriptions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PrescriptionForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PrescriptionDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PrescriptionForm />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--surface-color)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-lg)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                padding: "var(--spacing-4) var(--spacing-5)",
              },
              success: {
                duration: 3000,
                style: {
                  background: "var(--success-50)",
                  color: "var(--success-800)",
                  border: "1px solid var(--success-200)",
                },
                iconTheme: {
                  primary: "var(--success-600)",
                  secondary: "var(--success-50)",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "var(--danger-50)",
                  color: "var(--danger-800)",
                  border: "1px solid var(--danger-200)",
                },
                iconTheme: {
                  primary: "var(--danger-600)",
                  secondary: "var(--danger-50)",
                },
              },
              loading: {
                style: {
                  background: "var(--primary-50)",
                  color: "var(--primary-800)",
                  border: "1px solid var(--primary-200)",
                },
                iconTheme: {
                  primary: "var(--primary-600)",
                  secondary: "var(--primary-50)",
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
