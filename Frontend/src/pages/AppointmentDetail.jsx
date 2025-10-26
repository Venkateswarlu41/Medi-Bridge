import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  FileText,
  Activity,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Save,
  Phone,
  Mail,
  MapPin,
  TestTube,
  Plus,
  Trash2,
  Eye,
  Send,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import appointmentService from '../services/appointment.service';
import labTestService from '../services/labTest.service';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const DetailCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 30px;
  gap: 20px;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 10px;
`;

const AppointmentId = styled.div`
  font-size: 16px;
  color: #718096;
  margin-bottom: 15px;
`;

const StatusBadge = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }

  &.success {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
    }
  }

  &.danger {
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
    }
  }

  &.secondary {
    background: #f7fafc;
    color: #4a5568;
    border: 2px solid #e2e8f0;

    &:hover {
      border-color: #667eea;
      color: #667eea;
    }
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  background: #f7fafc;
  padding: 25px;
  border-radius: 15px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  font-size: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #718096;
  min-width: 120px;
`;

const InfoValue = styled.span`
  color: #2d3748;
  font-weight: 500;
`;

const ChiefComplaintSection = styled.div`
  background: #f7fafc;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 20px;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #718096;
`;

// Lab Test Components
const LabTestSection = styled.div`
  background: #f7fafc;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 20px;
`;

const LabTestForm = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
`;

const FormSelect = styled.select`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormInput = styled.input`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormTextarea = styled.textarea`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const LabTestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LabTestItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TestName = styled.div`
  font-weight: 600;
  color: #2d3748;
  font-size: 16px;
`;

const TestDetails = styled.div`
  color: #718096;
  font-size: 14px;
`;

const TestStatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getTestStatusColor(props.$status)}20;
  color: ${props => getTestStatusColor(props.$status)};
`;

const TestActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SmallButton = styled(motion.button)`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;

  &.view {
    background: #e2e8f0;
    color: #4a5568;

    &:hover {
      background: #cbd5e0;
    }
  }

  &.danger {
    background: #fed7d7;
    color: #e53e3e;

    &:hover {
      background: #fecaca;
    }
  }
`;

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    scheduled: '#667eea',
    confirmed: '#48bb78',
    'in-progress': '#ed8936',
    completed: '#38b2ac',
    cancelled: '#e53e3e',
    'no-show': '#a0aec0'
  };
  return colors[status] || '#718096';
};

// Helper function to get test status color
const getTestStatusColor = (status) => {
  const colors = {
    requested: '#667eea',
    assigned: '#ed8936',
    'in-progress': '#f56565',
    completed: '#48bb78',
    reviewed: '#38b2ac',
    cancelled: '#e53e3e'
  };
  return colors[status] || '#718096';
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  const icons = {
    scheduled: Clock,
    confirmed: CheckCircle,
    'in-progress': AlertCircle,
    completed: CheckCircle,
    cancelled: X,
    'no-show': X
  };
  const Icon = icons[status] || Clock;
  return <Icon size={16} />;
};

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAnyRole, user } = useAuth();

  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [loading, setLoading] = useState(!location.state?.appointment);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  
  // Lab test states
  const [labTests, setLabTests] = useState([]);
  const [loadingLabTests, setLoadingLabTests] = useState(false);
  const [showLabTestForm, setShowLabTestForm] = useState(false);
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);
  const [newTest, setNewTest] = useState({
    testName: '',
    testType: '',
    priority: 'routine',
    assignedTechnician: '',
    clinicalIndication: '',
    specialInstructions: ''
  });
  const [submitingTest, setSubmitingTest] = useState(false);

  useEffect(() => {
    // If we have appointment data from navigation state, use it
    if (location.state?.appointment) {
      setAppointment(location.state.appointment);
      setNotes(location.state.appointment.notes || '');
      setLoading(false);
      // Fetch lab tests for this appointment only for authorized roles
      if (user?.role && ['admin', 'doctor', 'lab_technician'].includes(user.role)) {
        fetchLabTests(location.state.appointment._id);
      }
    } else {
      // Otherwise fetch from API
      fetchAppointmentDetail();
    }
  }, [id, location.state, user?.role]);

  const fetchAppointmentDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching appointment with ID:', id);
      
      const result = await appointmentService.getAppointmentById(id);
      console.log('API Response:', result);
      
      if (result.success) {
        setAppointment(result.data.appointment);
        setNotes(result.data.appointment.notes || '');
        // Fetch lab tests for this appointment only for authorized roles
        if (user?.role && ['admin', 'doctor', 'lab_technician'].includes(user.role)) {
          fetchLabTests(result.data.appointment._id);
        }
      } else {
        console.error('API Error:', result.message);
        toast.error(result.message || 'Failed to load appointment');
        navigate('/appointments');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      toast.error('Failed to load appointment details');
      navigate('/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const result = await appointmentService.updateAppointmentStatus(id, newStatus);
      if (result.success) {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointmentDetail();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleDownloadRecord = async () => {
    try {
      const result = await appointmentService.downloadAppointmentRecord(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download appointment record');
    }
  };

  const handleSaveNotes = async () => {
    try {
      // Save notes using the update appointment endpoint
      const result = await appointmentService.updateAppointment(id, { notes });
      if (result.success) {
        toast.success('Notes saved successfully');
        setIsEditingNotes(false);
        fetchAppointmentDetail();
      } else {
        toast.error(result.message || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Save notes error:', error);
      toast.error('Failed to save notes');
    }
  };

  // Fetch lab tests for appointment
  const fetchLabTests = async (appointmentId) => {
    try {
      setLoadingLabTests(true);
      const result = await labTestService.getLabTestsForAppointment(appointmentId);
      if (result.success) {
        setLabTests(result.data.labTests || []);
      } else {
        console.error('Failed to fetch lab tests:', result.message);
        // Don't show error for patients as they don't have access to lab tests
        if (!user?.role || user.role === 'patient') {
          setLabTests([]);
        }
      }
    } catch (error) {
      console.error('Fetch lab tests error:', error);
      // Don't show error for patients as they don't have access to lab tests
      if (!user?.role || user.role === 'patient') {
        setLabTests([]);
      }
    } finally {
      setLoadingLabTests(false);
    }
  };

  // Fetch available lab technicians
  const fetchAvailableTechnicians = async (departmentId = null) => {
    try {
      setLoadingTechnicians(true);
      const result = await labTestService.getAvailableLabTechnicians(departmentId);
      if (result.success) {
        setAvailableTechnicians(result.data.technicians || []);
      } else {
        console.error('Failed to fetch technicians:', result.message);
      }
    } catch (error) {
      console.error('Fetch technicians error:', error);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  // Handle creating new lab test
  const handleCreateLabTest = async () => {
    if (!newTest.testName || !newTest.testType) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSubmitingTest(true);
      const testData = {
        appointmentId: appointment._id,
        testName: newTest.testName,
        testType: newTest.testType,
        priority: newTest.priority,
        clinicalIndication: newTest.clinicalIndication,
        specialInstructions: newTest.specialInstructions
      };
      
      // Only include assignedTechnician if a technician is selected
      if (newTest.assignedTechnician && newTest.assignedTechnician.trim() !== '') {
        testData.assignedTechnician = newTest.assignedTechnician;
      }
      
      console.log('Sending lab test data:', testData);
      console.log('Appointment ID:', appointment._id);
      console.log('New test state:', newTest);

      const result = await labTestService.createLabTest(testData);
      if (result.success) {
        toast.success('Lab test requested successfully');
        setNewTest({
          testName: '',
          testType: '',
          priority: 'routine',
          clinicalIndication: '',
          specialInstructions: ''
        });
        setShowLabTestForm(false);
        // Refresh lab tests
        if (user?.role && ['admin', 'doctor', 'lab_technician'].includes(user.role)) {
          fetchLabTests(appointment._id);
        }
      } else {
        toast.error(result.message || 'Failed to create lab test request');
      }
    } catch (error) {
      console.error('Create lab test error:', error);
      toast.error('Failed to create lab test request');
    } finally {
      setSubmitingTest(false);
    }
  };

  // Handle viewing lab test details
  const handleViewLabTest = (labTest) => {
    // Navigate to lab test details page or show modal
    navigate(`/lab-tests/${labTest._id}`);
  };

  // Reset new test form
  const resetTestForm = () => {
    setNewTest({
      testName: '',
      testType: '',
      priority: 'routine',
      assignedTechnician: '',
      clinicalIndication: '',
      specialInstructions: ''
    });
    setShowLabTestForm(false);
  };

  // Handle lab test form opening
  const handleShowLabTestForm = async () => {
    setShowLabTestForm(true);
    await fetchAvailableTechnicians();
  };

  const formatDateTime = (date, time) => {
    try {
      const appointmentDate = parseISO(date);
      return `${format(appointmentDate, 'EEEE, MMMM dd, yyyy')} at ${time}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading appointment details...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!appointment) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Appointment not found</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton
        onClick={() => navigate('/appointments')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ArrowLeft size={16} />
        Back to Appointments
      </BackButton>

      <DetailCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <HeaderLeft>
            <Title>Appointment Details</Title>
            <AppointmentId>ID: {appointment.appointmentId}</AppointmentId>
            <StatusBadge $status={appointment.status}>
              {getStatusIcon(appointment.status)}
              {appointment.status}
            </StatusBadge>
          </HeaderLeft>

          <ActionsContainer>
            {/* Download button for all users */}
            <ActionButton
              className="secondary"
              onClick={handleDownloadRecord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              Download Record
            </ActionButton>

            {/* Admin/Doctor specific actions */}
            {hasAnyRole(['admin', 'doctor']) && (
              <>
                {appointment.status === 'scheduled' && (
                  <ActionButton
                    className="success"
                    onClick={() => handleStatusUpdate('confirmed')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle size={16} />
                    Confirm
                  </ActionButton>
                )}

                {appointment.status === 'confirmed' && (
                  <ActionButton
                    className="primary"
                    onClick={() => handleStatusUpdate('in-progress')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AlertCircle size={16} />
                    Start
                  </ActionButton>
                )}

                {appointment.status === 'in-progress' && (
                  <>
                    <ActionButton
                      className="success"
                      onClick={() => {
                        // Check if all lab tests are reviewed before allowing completion
                        const pendingTests = labTests.filter(test => 
                          test.status === 'completed' && !test.doctorReview?.reviewed
                        );
                        
                        if (pendingTests.length > 0) {
                          toast.error(`Please review ${pendingTests.length} pending lab test(s) before completing the appointment`);
                          return;
                        }
                        
                        handleStatusUpdate('completed');
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ fontSize: '16px', padding: '16px 24px' }}
                    >
                      <CheckCircle size={18} />
                      Complete Appointment
                    </ActionButton>
                    <ActionButton
                      className="danger"
                      onClick={() => handleStatusUpdate('cancelled')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={16} />
                      Cancel
                    </ActionButton>
                  </>
                )}

                {['scheduled', 'confirmed'].includes(appointment.status) && (
                  <ActionButton
                    className="danger"
                    onClick={() => handleStatusUpdate('cancelled')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={16} />
                    Cancel
                  </ActionButton>
                )}
              </>
            )}
          </ActionsContainer>
        </Header>

        <InfoGrid>
          <InfoSection>
            <SectionTitle>
              <Calendar size={20} />
              Appointment Information
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Date & Time:</InfoLabel>
              <InfoValue>{formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Type:</InfoLabel>
              <InfoValue style={{ textTransform: 'capitalize' }}>{appointment.type}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Duration:</InfoLabel>
              <InfoValue>{appointment.duration || 30} minutes</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Priority:</InfoLabel>
              <InfoValue style={{ textTransform: 'capitalize' }}>{appointment.priority || 'Normal'}</InfoValue>
            </InfoRow>
          </InfoSection>

          <InfoSection>
            <SectionTitle>
              <User size={20} />
              Patient Information
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>{appointment.patient?.firstName} {appointment.patient?.lastName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Email:</InfoLabel>
              <InfoValue>{appointment.patient?.email}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Phone:</InfoLabel>
              <InfoValue>{appointment.patient?.phone}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Date of Birth:</InfoLabel>
              <InfoValue>
                {appointment.patient?.dateOfBirth 
                  ? format(parseISO(appointment.patient.dateOfBirth), 'MMM dd, yyyy')
                  : 'N/A'
                }
              </InfoValue>
            </InfoRow>
          </InfoSection>

          <InfoSection>
            <SectionTitle>
              <UserCheck size={20} />
              Doctor Information
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Specialization:</InfoLabel>
              <InfoValue>{appointment.doctor?.specialization || 'General Medicine'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>License:</InfoLabel>
              <InfoValue>{appointment.doctor?.licenseNumber || 'N/A'}</InfoValue>
            </InfoRow>
          </InfoSection>

          <InfoSection>
            <SectionTitle>
              <Activity size={20} />
              Department
            </SectionTitle>
            <InfoRow>
              <InfoLabel>Department:</InfoLabel>
              <InfoValue>{appointment.department?.name || 'General'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Code:</InfoLabel>
              <InfoValue>{appointment.department?.code || 'N/A'}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Location:</InfoLabel>
              <InfoValue>
                {appointment.department?.location ? 
                  (
                    typeof appointment.department.location === 'string' 
                      ? appointment.department.location
                      : `${appointment.department.location.building || ''} ${appointment.department.location.floor ? `Floor ${appointment.department.location.floor}` : ''} ${appointment.department.location.wing || ''}`.trim() || 'N/A'
                  )
                  : 'N/A'
                }
              </InfoValue>
            </InfoRow>
          </InfoSection>
        </InfoGrid>

        {appointment.chiefComplaint && (
          <ChiefComplaintSection>
            <SectionTitle>
              <FileText size={20} />
              Chief Complaint
            </SectionTitle>
            <InfoValue>{appointment.chiefComplaint}</InfoValue>
          </ChiefComplaintSection>
        )}

        {appointment.symptoms && (
          <ChiefComplaintSection>
            <SectionTitle>
              <Activity size={20} />
              Symptoms
            </SectionTitle>
            <InfoValue>{appointment.symptoms}</InfoValue>
          </ChiefComplaintSection>
        )}

        {hasAnyRole(['admin', 'doctor']) && (
          <ChiefComplaintSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <SectionTitle style={{ margin: 0 }}>
                <FileText size={20} />
                Doctor's Notes
              </SectionTitle>
              {!isEditingNotes ? (
                <ActionButton
                  className="secondary"
                  onClick={() => setIsEditingNotes(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit size={16} />
                  Edit Notes
                </ActionButton>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <ActionButton
                    className="success"
                    onClick={handleSaveNotes}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={16} />
                    Save
                  </ActionButton>
                  <ActionButton
                    className="secondary"
                    onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(appointment.notes || '');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </ActionButton>
                </div>
              )}
            </div>
            {isEditingNotes ? (
              <NotesTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this appointment..."
              />
            ) : (
              <InfoValue>{appointment.notes || 'No notes added yet.'}</InfoValue>
            )}
          </ChiefComplaintSection>
        )}

        {/* Lab Tests Section - Only show for doctors and when appointment is in-progress or completed */}
        {hasAnyRole(['admin', 'doctor']) && ['in-progress', 'completed'].includes(appointment.status) && (
          <LabTestSection>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <SectionTitle style={{ margin: 0 }}>
                <TestTube size={20} />
                Lab Tests ({labTests.length})
              </SectionTitle>
              {!showLabTestForm && (
                <ActionButton
                  className="primary"
                  onClick={handleShowLabTestForm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={16} />
                  Request Lab Test
                </ActionButton>
              )}
            </div>

            {/* Lab Test Form */}
            {showLabTestForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LabTestForm>
                  <FormGroup>
                    <FormLabel>Test Name *</FormLabel>
                    <FormInput
                      type="text"
                      value={newTest.testName}
                      onChange={(e) => setNewTest({...newTest, testName: e.target.value})}
                      placeholder="Enter test name"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Test Type *</FormLabel>
                    <FormSelect
                      value={newTest.testType}
                      onChange={(e) => setNewTest({...newTest, testType: e.target.value})}
                    >
                      <option value="">Select test type</option>
                      <option value="blood">Blood Test</option>
                      <option value="urine">Urine Test</option>
                      <option value="imaging">Imaging</option>
                      <option value="pathology">Pathology</option>
                      <option value="microbiology">Microbiology</option>
                      <option value="biochemistry">Biochemistry</option>
                      <option value="hematology">Hematology</option>
                      <option value="other">Other</option>
                    </FormSelect>
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Priority</FormLabel>
                    <FormSelect
                      value={newTest.priority}
                      onChange={(e) => setNewTest({...newTest, priority: e.target.value})}
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </FormSelect>
                  </FormGroup>
                </LabTestForm>
                
                <FormGroup style={{ marginBottom: '15px' }}>
                  <FormLabel>Assign to Lab Technician</FormLabel>
                  <FormSelect
                    value={newTest.assignedTechnician}
                    onChange={(e) => setNewTest({...newTest, assignedTechnician: e.target.value})}
                    disabled={loadingTechnicians}
                  >
                    <option value="">Auto-assign (recommended)</option>
                    {availableTechnicians.map(tech => (
                      <option key={tech._id} value={tech._id}>
                        {tech.firstName} {tech.lastName}
                        {tech.department && ` (${tech.department.name})`}
                        {tech.currentWorkload !== undefined && ` - ${tech.currentWorkload} active tests`}
                      </option>
                    ))}
                  </FormSelect>
                  {loadingTechnicians && (
                    <small style={{ color: '#718096', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      Loading technicians...
                    </small>
                  )}
                  <small style={{ color: '#718096', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Leave blank for automatic assignment based on workload and department
                  </small>
                </FormGroup>
                
                <FormGroup style={{ marginBottom: '15px' }}>
                  <FormLabel>Clinical Indication</FormLabel>
                  <FormTextarea
                    value={newTest.clinicalIndication}
                    onChange={(e) => setNewTest({...newTest, clinicalIndication: e.target.value})}
                    placeholder="Enter clinical indication for this test"
                  />
                </FormGroup>
                
                <FormGroup style={{ marginBottom: '20px' }}>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormTextarea
                    value={newTest.specialInstructions}
                    onChange={(e) => setNewTest({...newTest, specialInstructions: e.target.value})}
                    placeholder="Enter any special instructions"
                  />
                </FormGroup>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <ActionButton
                    className="success"
                    onClick={handleCreateLabTest}
                    disabled={submitingTest}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={16} />
                    {submitingTest ? 'Requesting...' : 'Request Test'}
                  </ActionButton>
                  <ActionButton
                    className="secondary"
                    onClick={resetTestForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </ActionButton>
                </div>
              </motion.div>
            )}

            {/* Lab Tests List */}
            {loadingLabTests ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
                Loading lab tests...
              </div>
            ) : (
              <LabTestList>
                {labTests.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#718096',
                    background: 'white',
                    borderRadius: '12px',
                    border: '2px dashed #e2e8f0'
                  }}>
                    No lab tests requested for this appointment
                  </div>
                ) : (
                  labTests.map(test => (
                    <LabTestItem key={test._id}>
                      <TestInfo>
                        <TestName>{test.testName}</TestName>
                        <TestDetails>
                          Type: {test.testType} | Priority: {test.priority} | 
                          Assigned to: {test.assignedTechnician ? 
                            `${test.assignedTechnician.firstName} ${test.assignedTechnician.lastName}` : 
                            'Not assigned'
                          }
                        </TestDetails>
                        <TestDetails>
                          Requested: {format(parseISO(test.requestDate), 'MMM dd, yyyy hh:mm a')}
                          {test.completedDate && (
                            <span> | Completed: {format(parseISO(test.completedDate), 'MMM dd, yyyy hh:mm a')}</span>
                          )}
                        </TestDetails>
                        {test.results && test.results.conclusion && (
                          <TestDetails style={{ 
                            marginTop: '8px', 
                            padding: '8px', 
                            background: '#f0fff4', 
                            borderRadius: '6px',
                            border: '1px solid #68d391',
                            color: '#2f855a'
                          }}>
                            <strong>Result:</strong> {test.results.conclusion}
                          </TestDetails>
                        )}
                      </TestInfo>
                      <TestActions>
                        <TestStatusBadge $status={test.status}>
                          {test.status}
                        </TestStatusBadge>
                        <SmallButton
                          className="view"
                          onClick={() => handleViewLabTest(test)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye size={14} />
                          {test.status === 'completed' && !test.doctorReview?.reviewed ? 'Review' : 'View'}
                        </SmallButton>
                      </TestActions>
                    </LabTestItem>
                  ))
                )}
              </LabTestList>
            )}
          </LabTestSection>
        )}
      </DetailCard>
    </PageContainer>
  );
};

export default AppointmentDetail;