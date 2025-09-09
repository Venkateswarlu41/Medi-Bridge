import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  FileText, 
  Activity, 
  Heart,
  Clock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import appointmentService from '../../services/appointment.service';
import patientService from '../../services/patient.service';
import medicalRecordService from '../../services/medicalRecord.service';
import labTestService from '../../services/labTest.service';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled(motion.div)`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-md);
`;

const WelcomeContent = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 15px;
`;

const QuickActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
  border-left: 4px solid ${props => props.color || 'var(--primary-color)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || 'var(--primary-color)'}20;
  color: ${props => props.color || 'var(--primary-color)'};
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: var(--gray-600);
  font-size: 14px;
  margin-bottom: 10px;
`;

const StatDescription = styled.div`
  font-size: 12px;
  color: var(--gray-400);
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AppointmentItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 15px;
  background: var(--gray-50);
  border-radius: 10px;
  border-left: 4px solid ${props => getStatusColor(props.$status)};
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    box-shadow: var(--shadow-sm);
    transform: translateX(5px);
  }
`;

const AppointmentInfo = styled.div`
  flex: 1;
  margin-left: 15px;
`;

const AppointmentTitle = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 5px;
`;

const AppointmentDetails = styled.div`
  font-size: 14px;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 15px;
`;

const AppointmentStatus = styled.div`
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
`;

const HealthMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  padding: 20px;
  background: var(--gray-50);
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    box-shadow: var(--shadow-sm);
    transform: translateY(-3px);
  }
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
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
    margin: 0 0 10px;
    color: var(--gray-700);
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--gray-500);
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const QuickActionCard = styled(motion.button)`
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 15px;
  padding: 25px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const ActionIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

const ActionTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 8px;
`;

const ActionDescription = styled.div`
  font-size: 14px;
  color: var(--gray-600);
  line-height: 1.4;
`;

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    scheduled: 'var(--primary-color)',
    confirmed: '#48bb78',
    'in-progress': 'var(--warning-color)',
    completed: 'var(--secondary-color)',
    cancelled: 'var(--danger-color)',
    'no-show': 'var(--gray-400)'
  };
  return colors[status] || 'var(--gray-500)';
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'scheduled':
      return Clock;
    case 'confirmed':
      return CheckCircle;
    case 'in-progress':
      return Activity;
    case 'completed':
      return CheckCircle;
    case 'cancelled':
      return AlertCircle;
    case 'no-show':
      return AlertCircle;
    default:
      return Clock;
  }
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [patientStats, setPatientStats] = useState({});
  const [healthMetrics, setHealthMetrics] = useState({});

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const stats = {
          upcomingAppointments: 0,
          totalRecords: 0,
          pendingResults: 0
        };

        // Fetch upcoming appointments
        try {
          console.log('PatientDashboard: Fetching appointments with params:', { status: 'scheduled,confirmed', limit: 5 });
          const appointmentsResult = await appointmentService.getAllAppointments({ 
            status: 'scheduled,confirmed',
            limit: 5
          });
          
          console.log('PatientDashboard: Appointments API response:', appointmentsResult);
          if (appointmentsResult.success) {
            const appointments = appointmentsResult.data.appointments || [];
            console.log('PatientDashboard: Found appointments:', appointments.length);
            setUpcomingAppointments(appointments);
            stats.upcomingAppointments = appointments.length;
          } else {
            console.error('PatientDashboard: Appointments API error:', appointmentsResult.message);
          }
        } catch (error) {
          console.error('PatientDashboard: Error fetching appointments:', error);
        }

        // Fetch medical records count
        try {
          console.log('PatientDashboard: Fetching medical records with params:', { limit: 1000 });
          const recordsResult = await medicalRecordService.getAllMedicalRecords({ limit: 1000 });
          console.log('PatientDashboard: Medical records API response:', recordsResult);
          if (recordsResult.success) {
            const records = recordsResult.data.records || [];
            console.log('PatientDashboard: Found medical records:', records.length);
            stats.totalRecords = records.length;
          } else {
            console.error('PatientDashboard: Medical records API error:', recordsResult.message);
          }
        } catch (error) {
          console.error('PatientDashboard: Error fetching medical records:', error);
        }

        // Fetch lab tests for pending results  
        try {
          console.log('PatientDashboard: Fetching lab tests with params:', { status: 'completed' });
          const labTestsResult = await labTestService.getAllLabTests({ status: 'completed' });
          console.log('PatientDashboard: Lab tests API response:', labTestsResult);
          if (labTestsResult.success) {
            const labTests = labTestsResult.data.labTests || [];
            console.log('PatientDashboard: Found lab tests:', labTests.length);
            // Count tests that are completed but not yet reviewed by patient
            stats.pendingResults = labTests.filter(test => 
              test.status === 'completed' && !test.patientViewed
            ).length;
            console.log('PatientDashboard: Pending results count:', stats.pendingResults);
          } else {
            console.error('PatientDashboard: Lab tests API error:', labTestsResult.message);
          }
        } catch (error) {
          console.error('PatientDashboard: Error fetching lab tests:', error);
        }

        console.log('PatientDashboard: Final stats before setting:', stats);
        setPatientStats(stats);
        
        // Set default health metrics (these would typically come from patient profile)
        setHealthMetrics({
          heartRate: '75',
          bloodPressure: '120/80',
          weight: '68',
          bloodSugar: '90'
        });

      } catch (error) {
        console.error('Failed to fetch patient data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPatientData();
    }
  }, [user]);


  // Calculate health score based on various factors
  const calculateHealthScore = () => {
    let score = 85; // Base score
    
    // Adjust based on upcoming appointments
    if (patientStats.upcomingAppointments > 0) {
      score += 5; // Bonus for being proactive
    }
    
    // Adjust based on medical records activity
    if (patientStats.totalRecords > 5) {
      score += 5; // Regular health monitoring
    }
    
    // Deduct for pending test results
    if (patientStats.pendingResults > 0) {
      score -= patientStats.pendingResults * 2;
    }
    
    const finalScore = Math.max(60, Math.min(100, score));
    console.log('PatientDashboard: Health score calculation:', {
      baseScore: 85,
      upcomingAppointments: patientStats.upcomingAppointments,
      totalRecords: patientStats.totalRecords,
      pendingResults: patientStats.pendingResults,
      finalScore
    });
    return finalScore;
  };

  console.log('PatientDashboard: Current patientStats for dashboard display:', patientStats);

  const dashboardStats = [
    { 
      icon: Calendar, 
      label: 'Upcoming Appointments', 
      value: patientStats.upcomingAppointments || '0', 
      color: 'var(--primary-color)',
      description: 'Next 30 days'
    },
    { 
      icon: FileText, 
      label: 'Medical Records', 
      value: patientStats.totalRecords || '0', 
      color: '#48bb78',
      description: 'Total documents'
    },
    { 
      icon: Activity, 
      label: 'Test Results', 
      value: patientStats.pendingResults || '0', 
      color: 'var(--warning-color)',
      description: 'Pending review'
    },
    { 
      icon: Heart, 
      label: 'Health Score', 
      value: `${calculateHealthScore()}%`, 
      color: '#8b5cf6',
      description: 'Overall wellness'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString || 'Time TBD';
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>
          <div>Loading your dashboard...</div>
        </LoadingSpinner>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        <WelcomeContent>
          <WelcomeTitle>
            <Heart size={40} />
            Welcome back, {user?.firstName}! 👋
          </WelcomeTitle>
          <WelcomeSubtitle>
            Take control of your health journey. Your next appointment is{' '}
            {upcomingAppointments[0] ? 
              `on ${formatDate(upcomingAppointments[0].appointmentDate)}` : 
              'not scheduled yet'
            }.
          </WelcomeSubtitle>
        </WelcomeContent>
        <QuickActions>
          <QuickActionButton
            onClick={() => navigate('/appointments/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Book Appointment
          </QuickActionButton>
          <QuickActionButton
            onClick={() => navigate('/medical-records')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText size={18} />
            View Records
          </QuickActionButton>
        </QuickActions>
      </WelcomeSection>

      <StatsGrid>
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={index}
            color={stat.color}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >

            <StatHeader>
              <StatIcon color={stat.color}>
                <stat.icon size={24} />
              </StatIcon>
            </StatHeader>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
            <StatDescription>{stat.description}</StatDescription>
          </StatCard>
        ))}
      </StatsGrid>

      {/* Quick Actions Grid */}
      <Section style={{ marginBottom: '30px' }}>
        <SectionHeader>
          <SectionTitle>
            <Plus size={20} />
            Quick Actions
          </SectionTitle>
        </SectionHeader>
        
        <ActionGrid>
          <QuickActionCard
            onClick={() => navigate('/appointments/new')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon>
              <Calendar size={20} color="white" />
            </ActionIcon>
            <ActionTitle>Book Appointment</ActionTitle>
            <ActionDescription>Schedule a new appointment</ActionDescription>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/medical-records')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon>
              <FileText size={20} color="white" />
            </ActionIcon>
            <ActionTitle>Medical History</ActionTitle>
            <ActionDescription>View your medical records</ActionDescription>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/lab-results')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon>
              <Activity size={20} color="white" />
            </ActionIcon>
            <ActionTitle>Test Results</ActionTitle>
            <ActionDescription>Check your lab results</ActionDescription>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/prescriptions')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ActionIcon>
              <Heart size={20} color="white" />
            </ActionIcon>
            <ActionTitle>Health Tracking</ActionTitle>
            <ActionDescription>Monitor your health metrics</ActionDescription>
          </QuickActionCard>
        </ActionGrid>
      </Section>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>
              <Calendar size={20} />
              Upcoming Appointments
            </SectionTitle>
            <ViewAllButton onClick={() => navigate('/appointments')}>
              <Eye size={16} /> View All
            </ViewAllButton>
          </SectionHeader>
          
          {upcomingAppointments.length > 0 ? (
            <AppointmentsList>
              {upcomingAppointments.slice(0, 4).map((appointment, index) => {
                const StatusIcon = getStatusIcon(appointment.status);
                return (
                  <AppointmentItem
                    key={appointment._id}
                    $status={appointment.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <StatusIcon size={20} color={getStatusColor(appointment.status)} />

                    <AppointmentInfo>
                      <AppointmentTitle>
                        Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                      </AppointmentTitle>
                      <AppointmentDetails>
                        <span>{formatDate(appointment.appointmentDate)}</span>
                        <span>{formatTime(appointment.appointmentTime)}</span>
                        <span>{appointment.type}</span>
                      </AppointmentDetails>
                    </AppointmentInfo>
                    <AppointmentStatus $status={appointment.status}>
                      {appointment.status}
                    </AppointmentStatus>
                  </AppointmentItem>
                );
              })}
            </AppointmentsList>
          ) : (
            <EmptyState>
              <Calendar size={40} />
              <h4>No upcoming appointments</h4>
              <p>Schedule your next appointment to stay on top of your health</p>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <Activity size={20} />
              Health Overview
            </SectionTitle>
          </SectionHeader>
          
          <HealthMetrics>
            <MetricCard>
              <MetricValue>{healthMetrics.heartRate || '75'}</MetricValue>
              <MetricLabel>Heart Rate (bpm)</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{healthMetrics.bloodPressure || '120/80'}</MetricValue>
              <MetricLabel>Blood Pressure (mmHg)</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{healthMetrics.weight || '68'}</MetricValue>
              <MetricLabel>Weight (kg)</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{healthMetrics.bloodSugar || '90'}</MetricValue>
              <MetricLabel>Blood Sugar (mg/dL)</MetricLabel>
            </MetricCard>
          </HealthMetrics>
        </Section>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default PatientDashboard;