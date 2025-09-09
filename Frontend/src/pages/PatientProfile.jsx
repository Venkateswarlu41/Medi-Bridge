import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Activity,
  FileText,
  Clock,
  MapPin,
  Edit,
  Plus,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import patientService from '../services/patient.service';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--gray-200);
  background: white;
  border-radius: 10px;
  cursor: pointer;
  color: var(--gray-600);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
`;

const ProfileContainer = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ProfileCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: var(--shadow-sm);
  height: fit-content;
`;

const PatientAvatar = styled.div`
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 36px;
  margin: 0 auto 20px;
`;

const PatientName = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  text-align: center;
  margin: 0 0 8px;
`;

const PatientId = styled.div`
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
`;

const BloodGroup = styled.div`
  display: inline-block;
  padding: 6px 12px;
  background: #e53e3e20;
  color: #e53e3e;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin: 0 auto 20px;
  text-align: center;
`;

const PatientInfo = styled.div`
  border-top: 1px solid var(--gray-200);
  padding-top: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  color: var(--gray-600);
  font-size: 14px;

  svg {
    color: var(--gray-400);
  }
`;

const StatsSection = styled.div`
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--gray-200);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 15px;
  background: var(--gray-50);
  border-radius: 12px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const ContentCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: var(--shadow-sm);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-color);
    color: white;
  }

  &.primary {
    background: var(--primary-color);
    color: white;

    &:hover {
      background: var(--secondary-color);
    }
  }
`;

const VitalSignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const VitalCard = styled.div`
  padding: 15px;
  background: var(--gray-50);
  border-radius: 10px;
  text-align: center;
`;

const VitalValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 4px;
`;

const VitalLabel = styled.div`
  font-size: 12px;
  color: var(--gray-500);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--gray-500);

  svg {
    margin-bottom: 15px;
    color: var(--gray-400);
  }

  h4 {
    margin: 0 0 8px;
    color: var(--gray-700);
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const AlertCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: ${props => 
    props.$type === 'warning' ? '#fed7d7' : 
    props.$type === 'success' ? '#c6f6d5' : 
    '#e2e8f0'
  };
  color: ${props => 
    props.$type === 'warning' ? '#c53030' : 
    props.$type === 'success' ? '#2f855a' : 
    '#4a5568'
  };
  border-radius: 10px;
  margin-bottom: 15px;
`;

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientProfile();
  }, [id]);

  const fetchPatientProfile = async () => {
    setLoading(true);
    try {
      const response = await patientService.getPatientById(id);
      
      if (response.success) {
        setPatient(response.data.patient);
      } else {
        toast.error('Failed to fetch patient profile');
        navigate('/patients');
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      toast.error('An error occurred while fetching patient profile');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!patient) {
    return (
      <PageContainer>
        <EmptyState>
          <User size={60} />
          <h4>Patient not found</h4>
          <p>The requested patient profile could not be found.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton
          onClick={() => navigate('/patients')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </BackButton>
        <PageTitle>Patient Profile</PageTitle>
      </Header>

      <ProfileContainer>
        <ProfileCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PatientAvatar>
            {getInitials(patient.firstName, patient.lastName)}
          </PatientAvatar>
          
          <PatientName>{patient.firstName} {patient.lastName}</PatientName>
          <PatientId>ID: {patient.patientId || patient._id}</PatientId>

          {patient.bloodGroup && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <BloodGroup>
                <Heart size={14} style={{ marginRight: '4px' }} />
                {patient.bloodGroup}
              </BloodGroup>
            </div>
          )}

          <PatientInfo>
            <InfoRow>
              <Mail size={16} />
              <span>{patient.email}</span>
            </InfoRow>
            <InfoRow>
              <Phone size={16} />
              <span>{patient.phone || 'Not provided'}</span>
            </InfoRow>
            <InfoRow>
              <Calendar size={16} />
              <span>{calculateAge(patient.dateOfBirth)}</span>
            </InfoRow>
            <InfoRow>
              <User size={16} />
              <span>{patient.gender || 'Not specified'}</span>
            </InfoRow>
            {patient.address && (
              <InfoRow>
                <MapPin size={16} />
                <span>
                  {patient.address.street}, {patient.address.city}
                  {patient.address.state && `, ${patient.address.state}`}
                </span>
              </InfoRow>
            )}
          </PatientInfo>

          <StatsSection>
            <StatsGrid>
              <StatCard>
                <StatValue>{patient.stats?.totalAppointments || 0}</StatValue>
                <StatLabel>Appointments</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{patient.stats?.totalRecords || 0}</StatValue>
                <StatLabel>Records</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{patient.stats?.lastVisit || 'Never'}</StatValue>
                <StatLabel>Last Visit</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{patient.isActive ? 'Active' : 'Inactive'}</StatValue>
                <StatLabel>Status</StatLabel>
              </StatCard>
            </StatsGrid>
          </StatsSection>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <ActionButton
              className="primary"
              onClick={() => navigate(`/appointments/new?patientId=${id}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              Book Appointment
            </ActionButton>
            {user?.role === 'admin' && (
              <ActionButton
                onClick={() => navigate(`/patients/${id}/edit`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit size={16} />
                Edit
              </ActionButton>
            )}
          </div>
        </ProfileCard>

        <MainContent>
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardHeader>
              <CardTitle>
                <Activity size={20} />
                Health Information
              </CardTitle>
            </CardHeader>

            {patient.allergies && patient.allergies.length > 0 && (
              <AlertCard $type="warning">
                <AlertCircle size={20} />
                <div>
                  <strong>Allergies:</strong> {patient.allergies.join(', ')}
                </div>
              </AlertCard>
            )}

            {patient.chronicConditions && patient.chronicConditions.length > 0 && (
              <AlertCard $type="info">
                <FileText size={20} />
                <div>
                  <strong>Chronic Conditions:</strong> {patient.chronicConditions.join(', ')}
                </div>
              </AlertCard>
            )}

            {patient.currentMedications && patient.currentMedications.length > 0 && (
              <AlertCard $type="success">
                <CheckCircle size={20} />
                <div>
                  <strong>Current Medications:</strong> {patient.currentMedications.join(', ')}
                </div>
              </AlertCard>
            )}

            {(!patient.allergies || patient.allergies.length === 0) &&
             (!patient.chronicConditions || patient.chronicConditions.length === 0) &&
             (!patient.currentMedications || patient.currentMedications.length === 0) && (
              <EmptyState>
                <Activity size={40} />
                <h4>No health information available</h4>
                <p>Health records and medical history will appear here.</p>
              </EmptyState>
            )}
          </ContentCard>

          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CardHeader>
              <CardTitle>
                <Heart size={20} />
                Vital Signs
              </CardTitle>
              <ActionButton
                onClick={() => navigate(`/patients/${id}/vitals/new`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
                Add Vitals
              </ActionButton>
            </CardHeader>

            {patient.patientDetails?.vitalSigns && patient.patientDetails.vitalSigns.length > 0 ? (
              <VitalSignsGrid>
                {patient.patientDetails.vitalSigns.slice(-1).map((vital, index) => (
                  <div key={index}>
                    {vital.bloodPressure && (
                      <VitalCard>
                        <VitalValue>
                          {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                        </VitalValue>
                        <VitalLabel>Blood Pressure</VitalLabel>
                      </VitalCard>
                    )}
                    {vital.heartRate && (
                      <VitalCard>
                        <VitalValue>{vital.heartRate} bpm</VitalValue>
                        <VitalLabel>Heart Rate</VitalLabel>
                      </VitalCard>
                    )}
                    {vital.temperature && (
                      <VitalCard>
                        <VitalValue>{vital.temperature}°C</VitalValue>
                        <VitalLabel>Temperature</VitalLabel>
                      </VitalCard>
                    )}
                    {vital.weight && (
                      <VitalCard>
                        <VitalValue>{vital.weight} kg</VitalValue>
                        <VitalLabel>Weight</VitalLabel>
                      </VitalCard>
                    )}
                    {vital.height && (
                      <VitalCard>
                        <VitalValue>{vital.height} cm</VitalValue>
                        <VitalLabel>Height</VitalLabel>
                      </VitalCard>
                    )}
                    {vital.oxygenSaturation && (
                      <VitalCard>
                        <VitalValue>{vital.oxygenSaturation}%</VitalValue>
                        <VitalLabel>Oxygen Saturation</VitalLabel>
                      </VitalCard>
                    )}
                  </div>
                ))}
              </VitalSignsGrid>
            ) : (
              <EmptyState>
                <Heart size={40} />
                <h4>No vital signs recorded</h4>
                <p>Vital signs and measurements will appear here.</p>
              </EmptyState>
            )}
          </ContentCard>

          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <CardHeader>
              <CardTitle>
                <Users size={20} />
                Emergency Contact
              </CardTitle>
            </CardHeader>

            {patient.emergencyContact ? (
              <div>
                <InfoRow>
                  <User size={16} />
                  <span>{patient.emergencyContact.name}</span>
                </InfoRow>
                <InfoRow>
                  <Phone size={16} />
                  <span>{patient.emergencyContact.phone}</span>
                </InfoRow>
                <InfoRow>
                  <Heart size={16} />
                  <span>{patient.emergencyContact.relationship}</span>
                </InfoRow>
                {patient.emergencyContact.email && (
                  <InfoRow>
                    <Mail size={16} />
                    <span>{patient.emergencyContact.email}</span>
                  </InfoRow>
                )}
              </div>
            ) : (
              <EmptyState>
                <Users size={40} />
                <h4>No emergency contact</h4>
                <p>Emergency contact information is not available.</p>
              </EmptyState>
            )}
          </ContentCard>
        </MainContent>
      </ProfileContainer>
    </PageContainer>
  );
};

export default PatientProfile;