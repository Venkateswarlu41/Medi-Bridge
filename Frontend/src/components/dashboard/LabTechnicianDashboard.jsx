import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  TestTube,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Heart,
  FileText,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import labTestService from '../../services/labTest.service';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f7fafc;
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
  display: flex;
  align-items: center;
  gap: 15px;
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

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  
  &:hover {
    text-decoration: underline;
  }
`;

const TestList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TestItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f7fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #edf2f7;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
`;

const TestDetails = styled.div`
  font-size: 14px;
  color: #718096;
`;

const TestTime = styled.div`
  font-size: 12px;
  color: #a0aec0;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
  margin-right: 10px;
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

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #718096;
`;

// Helper function to get status color
const getStatusColor = (status) => {
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

const LabTechnicianDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [assignedTests, setAssignedTests] = useState([]);
  const [stats, setStats] = useState({
    assignedTests: 0,
    inProgressTests: 0,
    completedToday: 0,
    pendingReview: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned lab tests
      const result = await labTestService.getAssignedLabTests({
        limit: 10,
        status: 'assigned,in-progress'
      });
      
      if (result.success) {
        const tests = result.data.labTests || [];
        setAssignedTests(tests);
        
        // Calculate stats from the tests
        const assignedCount = tests.filter(test => test.status === 'assigned').length;
        const inProgressCount = tests.filter(test => test.status === 'in-progress').length;
        
        // Fetch additional stats
        const allAssignedResult = await labTestService.getAllLabTests();
        if (allAssignedResult.success) {
          const allTests = allAssignedResult.data.labTests || [];
          const today = new Date().toDateString();
          const completedTodayCount = allTests.filter(test => 
            test.status === 'completed' && 
            new Date(test.completedDate).toDateString() === today
          ).length;
          const pendingReviewCount = allTests.filter(test => test.status === 'completed').length;
          
          setStats({
            assignedTests: assignedCount,
            inProgressTests: inProgressCount,
            completedToday: completedTodayCount,
            pendingReview: pendingReviewCount
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTestClick = (test) => {
    navigate(`/lab-tests/${test._id}`);
  };

  const quickActions = [
    {
      icon: TestTube,
      title: 'My Lab Tests',
      description: 'View all assigned tests',
      action: () => navigate('/lab-tests')
    },
    {
      icon: Upload,
      title: 'Upload Results',
      description: 'Upload test results',
      action: () => navigate('/lab-tests?status=in-progress')
    },
    {
      icon: Activity,
      title: 'Test History',
      description: 'View completed tests',
      action: () => navigate('/lab-tests?status=completed')
    },
    {
      icon: FileText,
      title: 'Quality Control',
      description: 'Review test quality',
      action: () => navigate('/quality-control')
    }
  ];

  const dashboardStats = [
    { 
      icon: Clock, 
      label: 'Assigned Tests', 
      value: stats.assignedTests.toString(), 
      color: '#ed8936' 
    },
    { 
      icon: Activity, 
      label: 'In Progress', 
      value: stats.inProgressTests.toString(), 
      color: '#f56565' 
    },
    { 
      icon: CheckCircle, 
      label: 'Completed Today', 
      value: stats.completedToday.toString(), 
      color: '#48bb78' 
    },
    { 
      icon: Eye, 
      label: 'Pending Review', 
      value: stats.pendingReview.toString(), 
      color: '#667eea' 
    }
  ];

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
          <TestTube size={40} />
          Welcome back, {user?.firstName}!
        </WelcomeTitle>
        <WelcomeSubtitle>
          Here's your lab technician dashboard with your assigned tests and activities.
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
          <SectionTitle>
            Assigned Tests
            <ViewAllButton onClick={() => navigate('/lab-tests')}>
              <Eye size={16} /> View All
            </ViewAllButton>
          </SectionTitle>
          
          {assignedTests.length > 0 ? (
            <TestList>
              {assignedTests.slice(0, 5).map((test, index) => (
                <TestItem key={test._id} onClick={() => handleTestClick(test)}>
                  <TestInfo>
                    <TestName>{test.testName}</TestName>
                    <TestDetails>
                      Patient: {test.patient?.firstName} {test.patient?.lastName} | 
                      Type: {test.testType} | Priority: {test.priority}
                    </TestDetails>
                    <TestTime>
                      Requested: {format(parseISO(test.requestDate), 'MMM dd, yyyy hh:mm a')}
                    </TestTime>
                  </TestInfo>
                  <StatusBadge $status={test.status}>
                    {test.status}
                  </StatusBadge>
                </TestItem>
              ))}
            </TestList>
          ) : (
            <EmptyState>
              <TestTube size={48} color="#cbd5e0" />
              <h4>No assigned tests</h4>
              <p>Your assigned lab tests will appear here</p>
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

export default LabTechnicianDashboard;