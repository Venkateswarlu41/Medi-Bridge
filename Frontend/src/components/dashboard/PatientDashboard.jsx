import { useState, useEffect } from 'react';
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
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  Upload,
  Bot,
  TrendingUp,
  Bell,
  Settings,
  User as UserIcon,
  BarChart3,
  Stethoscope,
  Pill,
  ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';
import appointmentService from '../../services/appointment.service';
import medicalRecordService from '../../services/medicalRecord.service';
import labTestService from '../../services/labTest.service';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  background: transparent;
`;

const HeaderSection = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 48px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.25);
  
  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -5%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -5%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 16px;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.92);
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
`;

const HeaderRight = styled.div`
  display: none;
  
  @media (min-width: 769px) {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const ProfileAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: scale(1.05);
  }
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.borderColor || '#2563eb'};
  }
`;

const StatIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: ${props => props.gradient || 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px ${props => props.shadowColor || 'rgba(37, 99, 235, 0.25)'};
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const DashboardCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardIconSmall = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.gradient || 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #eff6ff;
    color: #1d4ed8;
  }
`;

const RecordCount = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const RecordNumber = styled.div`
  font-size: 64px;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
`;

const RecordLabel = styled.div`
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
`;

const HealthScoreWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const CircularProgress = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
    #10b981 0deg ${props => props.value * 3.6}deg,
    #e5e7eb ${props => props.value * 3.6}deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 16px;
  
  &::before {
    content: '';
    position: absolute;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: white;
  }
`;

const ProgressValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  z-index: 1;
`;

const HealthScoreLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const TestResultsPreview = styled.div`
  padding: 20px 0;
`;

const TestResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
`;

const TestResultInfo = styled.div`
  flex: 1;
`;

const TestResultLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const TestResultValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
`;

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const AppointmentItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  border-left: 3px solid #2563eb;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 12px;
  
  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateX(4px);
  }
`;

const AppointmentInfo = styled.div`
  flex: 1;
  margin-left: 16px;
`;

const AppointmentTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 15px;
`;

const AppointmentDetails = styled.div`
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AppointmentStatus = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
  border: 1px solid ${props => getStatusColor(props.$status)}40;
`;

const ActivityTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 13px;
  color: #64748b;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #64748b;

  svg {
    margin-bottom: 16px;
    color: #cbd5e1;
  }

  h4 {
    margin: 0 0 8px;
    color: #475569;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #64748b;
  font-size: 18px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid #e0e7ff;
    border-top: 3px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-left: 16px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const QuickActionsSection = styled.div`
  margin-bottom: 32px;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const QuickActionCard = styled(motion.button)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    border-color: #2563eb;
  }
`;

const ActionIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${props => props.gradient || 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px ${props => props.shadowColor || 'rgba(37, 99, 235, 0.3)'};
`;

const ActionLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
`;

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    scheduled: '#0ea5e9',
    confirmed: '#22c55e',
    'in-progress': '#f59e0b',
    completed: '#16a34a',
    cancelled: '#dc2626',
    'no-show': '#64748b'
  };
  return colors[status] || '#64748b';
};



const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Changed to false to show dashboard immediately
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [patientStats, setPatientStats] = useState({});
  const [healthMetrics, setHealthMetrics] = useState({});

  console.log('PatientDashboard: Component rendering, loading:', loading, 'user:', user);

  // Emergency fallback - if something is wrong, show a simple message
  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading user data...</h2>
        <p>Please wait while we load your dashboard.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchPatientData = async () => {
      console.log('PatientDashboard: Starting data fetch, user:', user);

      try {
        console.log('PatientDashboard: Fetching patient dashboard data');

        let stats = {
          upcomingAppointments: 0,
          totalRecords: 0,
          pendingResults: 0
        };

        // Fetch patient's appointments for display and count
        try {
          console.log('PatientDashboard: Fetching patient appointments');
          const appointmentsResult = await appointmentService.getMyAppointments({
            limit: 100 // Fetch more to get accurate count
          });

          console.log('PatientDashboard: Appointments API response:', appointmentsResult);
          console.log('PatientDashboard: Appointments success:', appointmentsResult.success);
          console.log('PatientDashboard: Appointments data:', appointmentsResult.data);
          if (appointmentsResult.success && appointmentsResult.data) {
            // Handle different response structures
            let allAppointments = [];
            if (Array.isArray(appointmentsResult.data)) {
              allAppointments = appointmentsResult.data;
            } else if (appointmentsResult.data.appointments) {
              allAppointments = appointmentsResult.data.appointments;
            } else if (appointmentsResult.data.data) {
              allAppointments = appointmentsResult.data.data;
            }

            console.log('PatientDashboard: Found total appointments:', allAppointments.length);

            // Filter upcoming appointments (scheduled, confirmed, or future dates)
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Start of today

            const upcoming = allAppointments.filter(apt => {
              const aptDate = new Date(apt.appointmentDate);
              aptDate.setHours(0, 0, 0, 0);
              return (apt.status === 'scheduled' || apt.status === 'confirmed') && aptDate >= now;
            });

            console.log('PatientDashboard: Upcoming appointments:', upcoming.length);

            // If no upcoming, show recent appointments instead
            const appointmentsToShow = upcoming.length > 0
              ? upcoming.slice(0, 5)
              : allAppointments.slice(0, 5);

            setUpcomingAppointments(appointmentsToShow);

            // Update stats with actual counts
            stats.upcomingAppointments = upcoming.length;
            stats.totalAppointments = allAppointments.length;

            // Count total appointments for display
            const totalAppointments = allAppointments.length;
            console.log('PatientDashboard: Total appointments:', totalAppointments);

          } else {
            console.error('PatientDashboard: Appointments API error:', appointmentsResult.message);
            // Set empty appointments on error
            setUpcomingAppointments([]);
          }
        } catch (error) {
          console.error('PatientDashboard: Error fetching appointments:', error);
          // Set empty appointments on error
          setUpcomingAppointments([]);
        }

        // Fetch patient's medical records count
        try {
          console.log('PatientDashboard: Fetching medical records');
          const recordsResult = await medicalRecordService.getMyMedicalRecords({ limit: 100 });
          console.log('PatientDashboard: Medical records response:', recordsResult);
          if (recordsResult.success) {
            const records = recordsResult.data.medicalRecords || recordsResult.data.records || recordsResult.data || [];
            stats.totalRecords = Array.isArray(records) ? records.length : 0;
            console.log('PatientDashboard: Total medical records:', stats.totalRecords);
          } else {
            console.error('PatientDashboard: Medical records API error:', recordsResult.message);
          }
        } catch (error) {
          console.error('PatientDashboard: Error fetching medical records:', error);
        }

        // Fetch patient's lab tests count
        try {
          console.log('PatientDashboard: Fetching lab tests');
          const labTestsResult = await labTestService.getMyLabTests({ limit: 100 });
          console.log('PatientDashboard: Lab tests response:', labTestsResult);
          if (labTestsResult.success) {
            const tests = labTestsResult.data.labTests || labTestsResult.data.tests || labTestsResult.data || [];
            const testsArray = Array.isArray(tests) ? tests : [];
            stats.pendingResults = testsArray.filter(test => test.status === 'pending' || test.status === 'completed').length;
            console.log('PatientDashboard: Total test results:', stats.pendingResults);
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
        console.log('PatientDashboard: Data fetch complete');
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

  const getInitials = () => {
    if (!user?.firstName) return 'P';
    return `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  // Debug logging
  console.log('=== PatientDashboard Render ===');
  console.log('patientStats:', patientStats);
  console.log('upcomingAppointments count:', upcomingAppointments.length);
  console.log('upcomingAppointments:', upcomingAppointments);

  return (
    <DashboardContainer>
      {/* Debug: Ensure something renders */}
      <div style={{ padding: '20px', background: 'white', margin: '20px', borderRadius: '8px' }}>
        <h1>Patient Dashboard</h1>
        <p>User: {user?.firstName} {user?.lastName}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Stats: {JSON.stringify(patientStats)}</p>
      </div>

      <HeaderSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <HeaderContent>
          <HeaderLeft>
            <WelcomeTitle>
              <Heart size={32} strokeWidth={2.5} fill="rgba(255, 255, 255, 0.2)" />
              Welcome back, {user?.firstName}!
            </WelcomeTitle>
            <WelcomeSubtitle>
              Here's what's happening in your patient dashboard today.
            </WelcomeSubtitle>
          </HeaderLeft>

          <HeaderRight>
            <IconButton onClick={() => navigate('/notifications')}>
              <Bell size={20} />
            </IconButton>
            <IconButton onClick={() => navigate('/settings')}>
              <Settings size={20} />
            </IconButton>
            <ProfileAvatar onClick={() => navigate('/profile')}>
              {getInitials()}
            </ProfileAvatar>
          </HeaderRight>
        </HeaderContent>
      </HeaderSection>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          borderColor="#2563eb"
        >
          <StatIconWrapper gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" shadowColor="rgba(37, 99, 235, 0.25)">
            <Calendar size={28} />
          </StatIconWrapper>
          <StatValue>
            {patientStats.totalAppointments !== undefined && patientStats.upcomingAppointments === 0
              ? patientStats.totalAppointments
              : (patientStats.upcomingAppointments !== undefined ? patientStats.upcomingAppointments : '0')}
          </StatValue>
          <StatLabel>
            {patientStats.upcomingAppointments === 0 && patientStats.totalAppointments > 0
              ? 'Total Appointments'
              : 'Upcoming Appointments'}
          </StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          borderColor="#10b981"
        >
          <StatIconWrapper gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" shadowColor="rgba(16, 185, 129, 0.25)">
            <FileText size={28} />
          </StatIconWrapper>
          <StatValue>{patientStats.totalRecords !== undefined ? patientStats.totalRecords : '0'}</StatValue>
          <StatLabel>Medical Records</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          borderColor="#f59e0b"
        >
          <StatIconWrapper gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" shadowColor="rgba(245, 158, 11, 0.25)">
            <Activity size={28} />
          </StatIconWrapper>
          <StatValue>{patientStats.pendingResults !== undefined ? patientStats.pendingResults : '0'}</StatValue>
          <StatLabel>Test Results</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          borderColor="#10b981"
        >
          <StatIconWrapper gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" shadowColor="rgba(16, 185, 129, 0.25)">
            <Heart size={28} />
          </StatIconWrapper>
          <StatValue>{calculateHealthScore()}%</StatValue>
          <StatLabel>Health Score</StatLabel>
        </StatCard>
      </StatsGrid>

      <MainGrid>
        <DashboardCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CardHeader>
            <CardTitle>
              <CardIconSmall gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)">
                <Calendar size={20} />
              </CardIconSmall>
              {patientStats.upcomingAppointments > 0 ? 'Upcoming Appointments' : 'Recent Appointments'}
            </CardTitle>
            <ViewAllLink onClick={() => navigate('/appointments')}>
              View All <Eye size={14} />
            </ViewAllLink>
          </CardHeader>

          {upcomingAppointments.length > 0 ? (
            <AppointmentsList>
              {upcomingAppointments.slice(0, 3).map((appointment, index) => (
                <AppointmentItem
                  key={appointment._id}
                  $status={appointment.status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => navigate(`/appointments/${appointment._id}`)}
                >
                  <Clock size={20} color="#2563eb" />
                  <AppointmentInfo>
                    <AppointmentTitle>
                      Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </AppointmentTitle>
                    <AppointmentDetails>
                      <span>{formatDate(appointment.appointmentDate)}</span>
                      <span>•</span>
                      <span>{formatTime(appointment.appointmentTime)}</span>
                    </AppointmentDetails>
                  </AppointmentInfo>
                  <AppointmentStatus $status={appointment.status}>
                    {appointment.status}
                  </AppointmentStatus>
                </AppointmentItem>
              ))}
            </AppointmentsList>
          ) : (
            <EmptyState>
              <Calendar size={40} />
              <h4>No upcoming appointments</h4>
              <p>Schedule your next appointment to stay on top of your health</p>
            </EmptyState>
          )}
        </DashboardCard>

        <DashboardCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardHeader>
            <CardTitle>
              <CardIconSmall gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                <FileText size={20} />
              </CardIconSmall>
              Medical Records
            </CardTitle>
            <ViewAllLink onClick={() => navigate('/medical-records')}>
              View All <Eye size={16} />
            </ViewAllLink>
          </CardHeader>

          <RecordCount>
            <RecordNumber>{patientStats.totalRecords || '0'}</RecordNumber>
            <RecordLabel>Available Records</RecordLabel>
          </RecordCount>
        </DashboardCard>

        <DashboardCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CardHeader>
            <CardTitle>
              <CardIconSmall gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                <Heart size={20} />
              </CardIconSmall>
              Health Score
            </CardTitle>
          </CardHeader>

          <HealthScoreWrapper>
            <CircularProgress value={calculateHealthScore()}>
              <ProgressValue>{calculateHealthScore()}%</ProgressValue>
            </CircularProgress>
            <HealthScoreLabel>Overall Wellness</HealthScoreLabel>
          </HealthScoreWrapper>
        </DashboardCard>

        <DashboardCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CardHeader>
            <CardTitle>
              <CardIconSmall gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                <BarChart3 size={20} />
              </CardIconSmall>
              Test Results
            </CardTitle>
            <ViewAllLink onClick={() => navigate('/lab-results')}>
              View All <Eye size={16} />
            </ViewAllLink>
          </CardHeader>

          <TestResultsPreview>
            <TestResultItem>
              <TrendingUp size={20} color="#10b981" />
              <TestResultInfo>
                <TestResultLabel>Recent Tests</TestResultLabel>
                <TestResultValue>{patientStats.pendingResults || '0'}</TestResultValue>
              </TestResultInfo>
            </TestResultItem>
          </TestResultsPreview>
        </DashboardCard>
      </MainGrid>

      <QuickActionsSection>
        <QuickActionsGrid>
          <QuickActionCard
            onClick={() => navigate('/appointments/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIconWrapper gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" shadowColor="rgba(37, 99, 235, 0.3)">
              <Calendar size={24} />
            </ActionIconWrapper>
            <ActionLabel>Book Appointment</ActionLabel>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/medical-records')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIconWrapper gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" shadowColor="rgba(16, 185, 129, 0.3)">
              <ClipboardList size={24} />
            </ActionIconWrapper>
            <ActionLabel>View Medical History</ActionLabel>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/ai-assistant')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIconWrapper gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" shadowColor="rgba(139, 92, 246, 0.3)">
              <Bot size={24} />
            </ActionIconWrapper>
            <ActionLabel>Ask AI Assistant</ActionLabel>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/upload-report')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIconWrapper gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" shadowColor="rgba(245, 158, 11, 0.3)">
              <Upload size={24} />
            </ActionIconWrapper>
            <ActionLabel>Upload Report</ActionLabel>
          </QuickActionCard>
        </QuickActionsGrid>
      </QuickActionsSection>

      <DashboardCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <CardHeader>
          <CardTitle>
            <CardIconSmall gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
              <Activity size={20} />
            </CardIconSmall>
            Recent Activity
          </CardTitle>
        </CardHeader>

        <ActivityTimeline>
          <ActivityItem>
            <ActivityIcon color="#10b981">
              <CheckCircle size={16} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Appointment Completed</ActivityTitle>
              <ActivityTime>2 days ago</ActivityTime>
            </ActivityContent>
          </ActivityItem>

          <ActivityItem>
            <ActivityIcon color="#2563eb">
              <FileText size={16} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Lab Results Uploaded</ActivityTitle>
              <ActivityTime>5 days ago</ActivityTime>
            </ActivityContent>
          </ActivityItem>

          <ActivityItem>
            <ActivityIcon color="#f59e0b">
              <Stethoscope size={16} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Health Checkup Scheduled</ActivityTitle>
              <ActivityTime>1 week ago</ActivityTime>
            </ActivityContent>
          </ActivityItem>

          <ActivityItem>
            <ActivityIcon color="#8b5cf6">
              <Pill size={16} />
            </ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Prescription Refilled</ActivityTitle>
              <ActivityTime>2 weeks ago</ActivityTime>
            </ActivityContent>
          </ActivityItem>
        </ActivityTimeline>
      </DashboardCard>
    </DashboardContainer>
  );
};

export default PatientDashboard;