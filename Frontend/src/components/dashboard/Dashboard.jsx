import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import LabTechnicianDashboard from './LabTechnicianDashboard';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  Heart,
  LogOut,
  Settings,
  Bell,
  Eye,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import appointmentService from '../../services/appointment.service';
import doctorService from '../../services/doctor.service';
import dashboardService from '../../services/dashboard.service';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafb 0%, #ffffff 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(84, 169, 234, 0.05) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const Header = styled.header`
  background: white;
  padding: 24px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(84, 169, 234, 0.3);
`;

const LogoText = styled.h1`
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  font-family: var(--font-family-heading);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserDetails = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
  font-family: var(--font-family-heading);
`;

const UserRole = styled.div`
  font-size: 13px;
  color: #6b7280;
  text-transform: capitalize;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 12px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: white;
    color: #54a9ea;
    border-color: #54a9ea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.15);
  }
`;

const LogoutButton = styled(ActionButton)`
  &:hover {
    background: #fef2f2;
    color: #ef4444;
    border-color: #fecaca;
  }
`;

const MainContent = styled.main`
  padding: 40px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const WelcomeSection = styled(motion.div)`
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  color: white;
  padding: 48px;
  border-radius: 24px;
  margin-bottom: 32px;
  box-shadow: 0 20px 60px rgba(84, 169, 234, 0.25);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px;
  font-family: var(--font-family-heading);
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  opacity: 0.95;
  margin: 0;
  position: relative;
  z-index: 1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 24px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || 'linear-gradient(90deg, #54a9ea 0%, #8458fd 100%)'};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(84, 169, 234, 0.12);
    border-color: rgba(84, 169, 234, 0.2);

    &::before {
      transform: scaleX(1);
    }
  }
`;

const StatIcon = styled.div`
  width: 68px;
  height: 68px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || 'linear-gradient(135deg, #54a9ea 0%, #8458fd 100%)'};
  box-shadow: 0 10px 25px ${props => props.color ? `${props.color}40` : 'rgba(84, 169, 234, 0.25)'};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    padding: 2px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
  font-family: var(--font-family-heading);
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
`;

const QuickActions = styled.div`
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px;
  font-family: var(--font-family-heading);
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
`;

const QuickActionCard = styled(motion.button)`
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.03) 0%, rgba(132, 88, 253, 0.03) 100%);
  border: 2px solid #e5e7eb;
  padding: 24px;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #54a9ea 0%, #8458fd 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: #54a9ea;
    background: white;
    box-shadow: 0 10px 30px rgba(84, 169, 234, 0.15);
    transform: translateY(-4px);

    &::before {
      transform: scaleX(1);
    }
  }
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 20px rgba(84, 169, 234, 0.3);
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
  font-size: 15px;
  font-family: var(--font-family-heading);
`;

const ActionDescription = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
`;

const ViewAllButton = styled.button`
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.1) 0%, rgba(132, 88, 253, 0.1) 100%);
  border: 2px solid #e5e7eb;
  color: #54a9ea;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.3);
  }
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.02) 0%, rgba(132, 88, 253, 0.02) 100%);
  border-radius: 14px;
  border: 2px solid #f3f4f6;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(84, 169, 234, 0.3);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.08);
  }
`;

const RecentInfo = styled.div`
  flex: 1;
`;

const RecentTitle = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
  font-size: 15px;
  font-family: var(--font-family-heading);
`;

const RecentSubtitle = styled.div`
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
`;

const RecentTime = styled.div`
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  background: #f9fafb;
  padding: 6px 12px;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.03) 0%, rgba(132, 88, 253, 0.03) 100%);
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
  
  h4 {
    margin: 12px 0 6px;
    color: #1a1a1a;
    font-weight: 600;
    font-family: var(--font-family-heading);
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.positive ? '#48bb78' : '#e53e3e'};
`;

const Dashboard = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  
  console.log('Dashboard: Rendering, user:', user);
  console.log('Dashboard: hasRole function:', hasRole);
  console.log('Dashboard: user.role:', user?.role);
  
  // If no user, show loading
  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading Dashboard...</h2>
        <p>Please wait while we load your information.</p>
      </div>
    );
  }
  
  // Default dashboard state for admin and other roles
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [adminStats, setAdminStats] = useState({});

  useEffect(() => {
    // Only fetch admin data if user is admin
    if (!hasRole || !hasRole('admin')) {
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch admin dashboard data
        const adminResult = await dashboardService.getAdminDashboard();
        
        if (adminResult.success) {
          setAdminStats(adminResult.data.stats || {});
          setRecentAppointments(adminResult.data.recentAppointments || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, hasRole]);
  
  // Route to role-specific dashboards
  console.log('Dashboard: Checking roles...');
  console.log('Dashboard: hasRole("patient"):', hasRole ? hasRole('patient') : 'hasRole is undefined');
  console.log('Dashboard: hasRole("doctor"):', hasRole ? hasRole('doctor') : 'hasRole is undefined');
  
  // Check user role directly (hasRole expects a string, not an array)
  if (user?.role === 'patient' || (hasRole && hasRole('patient'))) {
    console.log('Dashboard: Routing to PatientDashboard');
    return <PatientDashboard />;
  }
  
  if (user?.role === 'doctor' || (hasRole && hasRole('doctor'))) {
    console.log('Dashboard: Routing to DoctorDashboard');
    return <DoctorDashboard />;
  }
  
  if (user?.role === 'lab_technician' || (hasRole && hasRole('lab_technician'))) {
    return <LabTechnicianDashboard />;
  }

  const handleLogout = async () => {
    await logout();
  };

  const getStatsForRole = (role) => {
    switch (role) {
      case 'admin':
        return [
          { icon: Users, label: 'Total Patients', value: adminStats.totalPatients || '0', color: '#667eea' },
          { icon: Users, label: 'Staff Members', value: adminStats.totalStaff || '0', color: '#48bb78' },
          { icon: Calendar, label: 'Appointments Today', value: adminStats.todayAppointments || '0', color: '#ed8936' },
          { icon: Activity, label: 'System Health', value: adminStats.systemHealth || '0%', color: '#38b2ac' }
        ];
      case 'doctor':
        return [
          { icon: Users, label: 'My Patients', value: '0', color: '#667eea' },
          { icon: Calendar, label: 'Today\'s Appointments', value: '0', color: '#ed8936' },
          { icon: FileText, label: 'Pending Reports', value: '0', color: '#e53e3e' },
          { icon: Activity, label: 'Completed Today', value: '0', color: '#48bb78' }
        ];
      case 'patient':
        return [
          { icon: Calendar, label: 'Upcoming Appointments', value: '0', color: '#667eea' },
          { icon: FileText, label: 'Medical Records', value: '0', color: '#48bb78' },
          { icon: Activity, label: 'Test Results', value: '0', color: '#ed8936' },
          { icon: Heart, label: 'Health Score', value: '0%', color: '#38b2ac' }
        ];
      default:
        return [
          { icon: Users, label: 'Patients', value: '0', color: '#667eea' },
          { icon: Calendar, label: 'Appointments', value: '0', color: '#ed8936' },
          { icon: FileText, label: 'Records', value: '0', color: '#48bb78' },
          { icon: Activity, label: 'Tasks', value: '0', color: '#38b2ac' }
        ];
    }
  };

  const getQuickActionsForRole = (role) => {
    switch (role) {
      case 'admin':
        return [
          { 
            icon: Users, 
            title: 'Manage Users', 
            description: 'Add, edit, or remove users',
            action: () => navigate('/users')
          },
          { 
            icon: Calendar, 
            title: 'View All Appointments', 
            description: 'Monitor hospital schedule',
            action: () => navigate('/appointments')
          },
          { 
            icon: FileText, 
            title: 'Generate Reports', 
            description: 'Create system reports',
            action: () => navigate('/reports')
          },
          { 
            icon: Settings, 
            title: 'System Settings', 
            description: 'Configure hospital settings',
            action: () => navigate('/settings')
          }
        ];
      case 'doctor':
        return [
          { 
            icon: Calendar, 
            title: 'My Schedule', 
            description: 'View today\'s appointments',
            action: () => navigate('/appointments')
          },
          { 
            icon: Users, 
            title: 'Patient List', 
            description: 'Manage your patients',
            action: () => navigate('/patients')
          },
          { 
            icon: FileText, 
            title: 'Medical Records', 
            description: 'Update patient records',
            action: () => navigate('/medical-records')
          },
          { 
            icon: Activity, 
            title: 'Lab Results', 
            description: 'Review test results',
            action: () => navigate('/lab-results')
          }
        ];
      case 'patient':
        return [
          { 
            icon: Calendar, 
            title: 'Book Appointment', 
            description: 'Schedule a new appointment',
            action: () => navigate('/appointments/new')
          },
          { 
            icon: FileText, 
            title: 'Medical History', 
            description: 'View your medical records',
            action: () => navigate('/medical-records')
          },
          { 
            icon: Activity, 
            title: 'Test Results', 
            description: 'Check your lab results',
            action: () => navigate('/test-results')
          },
          { 
            icon: Heart, 
            title: 'Health Tracking', 
            description: 'Monitor your health metrics',
            action: () => navigate('/health-tracking')
          }
        ];
      default:
        return [];
    }
  };

  const dashboardStats = getStatsForRole(user?.role);
  const quickActions = getQuickActionsForRole(user?.role);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>
          <div>Loading dashboard...</div>
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
        <WelcomeTitle>
          <Heart size={40} />
          Welcome back, {user?.firstName}!
        </WelcomeTitle>
        <WelcomeSubtitle>
          Here's what's happening in your {user?.role?.replace('_', ' ')} dashboard today.
        </WelcomeSubtitle>
      </WelcomeSection>

      <StatsGrid>
        {dashboardStats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatIcon color={stat.color}>
              <stat.icon size={22} color="white" />
            </StatIcon>
            <StatInfo>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatInfo>
          </StatCard>
        ))}
      </StatsGrid>

      <SectionGrid>
        <Section>
          <SectionTitle style={{ display: 'flex', alignItems: 'center' }}>
            Recent {hasRole(['patient']) ? 'Appointments' : 'Activity'}
            <ViewAllButton onClick={() => navigate(hasRole(['patient']) ? '/appointments' : '/appointments')}>
              <Eye size={16} /> View All
            </ViewAllButton>
          </SectionTitle>
          
          {recentAppointments.length > 0 ? (
            <RecentList>
              {recentAppointments.slice(0, 5).map((appointment, index) => (
                <RecentItem key={index}>
                  <RecentInfo>
                    <RecentTitle>
                      {hasRole(['patient']) 
                        ? `Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`
                        : `${appointment.patient?.firstName} ${appointment.patient?.lastName}`
                      }
                    </RecentTitle>
                    <RecentSubtitle>{appointment.chiefComplaint || 'No description'}</RecentSubtitle>
                  </RecentInfo>
                  <RecentTime>
                    {appointment.appointmentTime || 'No time'}
                  </RecentTime>
                </RecentItem>
              ))}
            </RecentList>
          ) : (
            <EmptyState>
              <Calendar size={48} color="#cbd5e0" />
              <h4>No recent appointments</h4>
              <p>Your recent appointments will appear here</p>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionTitle>Quick Actions</SectionTitle>
          <ActionGrid>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                onClick={action.action}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionIcon>
                  <action.icon size={20} color="white" />
                </ActionIcon>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDescription>{action.description}</ActionDescription>
              </QuickActionCard>
            ))}
          </ActionGrid>
        </Section>
      </SectionGrid>
    </DashboardContainer>
  );
};

export default Dashboard;