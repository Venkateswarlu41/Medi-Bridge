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
  TrendingUp
} from 'lucide-react';
import appointmentService from '../../services/appointment.service';
import doctorService from '../../services/doctor.service';
import dashboardService from '../../services/dashboard.service';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f7fafc;
`;

const Header = styled.header`
  background: white;
  padding: 20px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserDetails = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const UserRole = styled.div`
  font-size: 14px;
  color: #718096;
  text-transform: capitalize;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 10px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  color: #4a5568;
  transition: all 0.3s ease;

  &:hover {
    background: #edf2f7;
    color: #2d3748;
  }
`;

const LogoutButton = styled(ActionButton)`
  &:hover {
    background: #fed7d7;
    color: #e53e3e;
    border-color: #feb2b2;
  }
`;

const MainContent = styled.main`
  padding: 30px;
`;

const WelcomeSection = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 30px;
`;

const WelcomeTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 10px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || '#667eea'};
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 14px;
`;

const QuickActions = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const QuickActionCard = styled(motion.button)`
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
`;

const ActionDescription = styled.div`
  font-size: 14px;
  color: #718096;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #718096;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  margin-left: auto;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RecentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f7fafc;
  border-radius: 10px;
`;

const RecentInfo = styled.div`
  flex: 1;
`;

const RecentTitle = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
`;

const RecentSubtitle = styled.div`
  font-size: 14px;
  color: #718096;
`;

const RecentTime = styled.div`
  font-size: 12px;
  color: #a0aec0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #718096;
  
  h4 {
    margin: 10px 0 5px;
    color: #4a5568;
  }
  
  p {
    margin: 0;
    font-size: 14px;
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
  
  // Route to role-specific dashboards
  if (hasRole(['patient'])) {
    return <PatientDashboard />;
  }
  
  if (hasRole(['doctor'])) {
    return <DoctorDashboard />;
  }
  
  if (hasRole(['lab_technician'])) {
    return <LabTechnicianDashboard />;
  }
  
  // Default dashboard for admin and other roles
  const [loading, setLoading] = useState(true);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [adminStats, setAdminStats] = useState({});

  useEffect(() => {
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