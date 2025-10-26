import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  Users,
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
  Stethoscope,
  TrendingUp,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import appointmentService from "../../services/appointment.service";
import doctorService from "../../services/doctor.service";
import patientService from "../../services/patient.service";
import LoadingSpinner from "../common/LoadingSpinner";

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const WelcomeSection = styled(motion.div)`
  background: white;
  padding: 0;
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  min-height: 160px;
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 32px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 20px;
  }
`;

const WelcomeLeft = styled.div`
  flex: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.3px;

  svg {
    color: #667eea;
    stroke-width: 2;
  }

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  font-weight: 400;
  max-width: 600px;
`;

const WelcomeRight = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    margin-top: 24px;
    width: 100%;
  }
`;

const QuickStatCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 28px;
  text-align: center;
  min-width: 130px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    flex: 1;
    min-width: auto;
  }
`;

const QuickStatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
`;

const QuickStatLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TodayStats = styled.div`
  display: none;
`;

const TodayStat = styled.div`
  display: none;
`;

const TodayStatValue = styled.div`
  display: none;
`;

const TodayStatLabel = styled.div`
  display: none;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => props.color || "var(--primary-color)"};
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.color || "var(--primary-color)"}15;
  color: ${(props) => props.color || "var(--primary-color)"};
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${(props) => (props.positive ? "#48bb78" : "var(--danger-color)")};
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: var(--gray-600);
  font-size: 14px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--gray-200);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
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
  gap: 12px;
`;

const AppointmentItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--gray-50);
  border-radius: 10px;
  border: 1px solid var(--gray-200);
  border-left: 3px solid ${(props) => getStatusColor(props.status)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    border-color: ${(props) => getStatusColor(props.status)};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const AppointmentTime = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  font-size: 16px;
  min-width: 70px;
`;

const AppointmentInfo = styled.div`
  flex: 1;
  margin-left: 15px;
`;

const PatientName = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 4px;
`;

const AppointmentDetails = styled.div`
  font-size: 14px;
  color: var(--gray-500);
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid var(--gray-200);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--gray-600);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.primary {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);

    &:hover {
      background: var(--primary-dark);
    }
  }
`;

const PatientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PatientItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--gray-50);
  border-radius: 10px;
  border: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientDetails = styled.div`
  font-size: 14px;
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PatientDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    scheduled: "var(--primary-color)",
    confirmed: "#48bb78",
    "in-progress": "var(--warning-color)",
    completed: "var(--secondary-color)",
    cancelled: "var(--danger-color)",
    "no-show": "var(--gray-400)",
  };
  return colors[status] || "var(--gray-500)";
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return "TBD";
  return timeString;
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Helper function to get patient initials
const getPatientInitials = (patient) => {
  if (!patient) return "P";
  return `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase();
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Changed to false to show immediately
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [doctorStats, setDoctorStats] = useState({});
  
  console.log('DoctorDashboard: Component rendering, loading:', loading, 'user:', user);

  useEffect(() => {
    const fetchDoctorData = async () => {
      console.log('DoctorDashboard: Fetching data for user:', user);
      try {
        // Fetch doctor stats
        const statsResult = await doctorService.getDoctorStats();
        if (statsResult.success) {
          setDoctorStats(statsResult.data || {});
        }

        // Fetch today's appointments
        const today = new Date().toISOString().split("T")[0];
        const appointmentsResult =
          await appointmentService.getDoctorAppointments({
            date: today,
            limit: 5,
          });

        if (appointmentsResult.success) {
          setTodayAppointments(appointmentsResult.data.appointments || []);
        }

        // Fetch recent patients
        const patientsResult = await patientService.getDoctorPatients({
          limit: 5,
          sort: "lastVisit",
        });

        if (patientsResult.success) {
          setRecentPatients(patientsResult.data.patients || []);
        }
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDoctorData();
    }
  }, [user]);

  const dashboardStats = [
    {
      icon: Calendar,
      label: "Total Appointments",
      value: doctorStats.totalAppointments || "0",
      color: "var(--primary-color)",
      trend: { value: "+12%", positive: true },
    },
    {
      icon: Users,
      label: "Total Patients",
      value: doctorStats.totalPatients || "0",
      color: "var(--secondary-color)",
      trend: { value: "+5%", positive: true },
    },
    {
      icon: Activity,
      label: "Completion Rate",
      value: doctorStats.completionRate || "95%",
      color: "#48bb78",
      trend: { value: "+2%", positive: true },
    },
    {
      icon: Award,
      label: "Satisfaction Score",
      value: doctorStats.satisfactionScore || "4.8",
      color: "var(--accent-color)",
      trend: { value: "+0.2", positive: true },
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardContainer>
      {/* Debug: Ensure something renders */}
      <div style={{ padding: '20px', background: 'white', margin: '20px', borderRadius: '8px' }}>
        <h1>Doctor Dashboard</h1>
        <p>User: Dr. {user?.lastName}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Today's Appointments: {doctorStats.todayAppointments || '0'}</p>
      </div>
      
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <WelcomeContent>
          <WelcomeLeft>
            <WelcomeTitle>
              <Stethoscope size={32} strokeWidth={2} />
              Welcome back, Dr. {user?.lastName}!
            </WelcomeTitle>
            <WelcomeSubtitle>
              Here's what's happening in your doctor dashboard today.
            </WelcomeSubtitle>
          </WelcomeLeft>

          <WelcomeRight>
            <QuickStatCard>
              <QuickStatValue>
                {doctorStats.todayAppointments || "0"}
              </QuickStatValue>
              <QuickStatLabel>Today</QuickStatLabel>
            </QuickStatCard>
            <QuickStatCard>
              <QuickStatValue>
                {doctorStats.totalPatients || "0"}
              </QuickStatValue>
              <QuickStatLabel>Patients</QuickStatLabel>
            </QuickStatCard>
          </WelcomeRight>
        </WelcomeContent>
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
              {stat.trend && (
                <StatTrend positive={stat.trend.positive}>
                  <TrendingUp size={14} />
                  {stat.trend.value}
                </StatTrend>
              )}
            </StatHeader>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>
              <Calendar size={20} />
              Today's Appointments
            </SectionTitle>
            <ViewAllButton onClick={() => navigate("/appointments")}>
              <Eye size={16} /> View All
            </ViewAllButton>
          </SectionHeader>

          {todayAppointments.length > 0 ? (
            <AppointmentsList>
              {todayAppointments.map((appointment, index) => (
                <AppointmentItem
                  key={appointment._id}
                  status={appointment.status}
                  onClick={() => navigate(`/appointments/${appointment._id}`)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AppointmentTime>
                    {formatTime(appointment.appointmentTime)}
                  </AppointmentTime>

                  <AppointmentInfo>
                    <PatientName>
                      {appointment.patient?.firstName}{" "}
                      {appointment.patient?.lastName}
                    </PatientName>
                    <AppointmentDetails>
                      {appointment.type} • {appointment.status}
                    </AppointmentDetails>
                  </AppointmentInfo>

                  <AppointmentActions>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/medical-records/new?patientId=${appointment.patient?._id}`,
                        );
                      }}
                    >
                      Add Notes
                    </ActionButton>
                    <ActionButton
                      className="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/appointments/${appointment._id}`);
                      }}
                    >
                      Start
                    </ActionButton>
                  </AppointmentActions>
                </AppointmentItem>
              ))}
            </AppointmentsList>
          ) : (
            <EmptyState>
              <Calendar size={40} />
              <h4>No appointments for today</h4>
              <p>You have no scheduled appointments for today</p>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <Users size={20} />
              Recent Patients
            </SectionTitle>
            <ViewAllButton onClick={() => navigate("/patients")}>
              <Eye size={16} /> View All
            </ViewAllButton>
          </SectionHeader>

          {recentPatients.length > 0 ? (
            <PatientsList>
              {recentPatients.map((patient, index) => (
                <PatientItem
                  key={patient._id}
                  onClick={() => navigate(`/patients/${patient._id}`)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <PatientAvatar>{getPatientInitials(patient)}</PatientAvatar>

                  <PatientInfo>
                    <PatientName>
                      {patient.firstName} {patient.lastName}
                    </PatientName>
                    <PatientDetails>
                      <PatientDetail>
                        <User size={14} />
                        {patient.gender}, {patient.age} yrs
                      </PatientDetail>
                      <PatientDetail>
                        <Phone size={14} />
                        {patient.phone}
                      </PatientDetail>
                    </PatientDetails>
                  </PatientInfo>
                </PatientItem>
              ))}
            </PatientsList>
          ) : (
            <EmptyState>
              <Users size={40} />
              <h4>No recent patients</h4>
              <p>You haven't seen any patients recently</p>
            </EmptyState>
          )}
        </Section>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default DoctorDashboard;
