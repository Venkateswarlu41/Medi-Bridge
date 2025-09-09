import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Award,
  Activity,
  Users,
  FileText,
  Clock,
  MapPin,
  Star,
  Edit,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import doctorService from '../services/doctor.service';
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

const DoctorAvatar = styled.div`
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

const DoctorName = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  text-align: center;
  margin: 0 0 8px;
`;

const DoctorSpecialization = styled.div`
  font-size: 16px;
  color: var(--primary-color);
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
`;

const DoctorInfo = styled.div`
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
  justify-content: between;
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

const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AppointmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--gray-50);
  border-radius: 10px;
  border-left: 4px solid var(--primary-color);
`;

const AppointmentInfo = styled.div`
  flex: 1;
`;

const AppointmentPatient = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 4px;
`;

const AppointmentDetails = styled.div`
  font-size: 12px;
  color: var(--gray-500);
`;

const AppointmentTime = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
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

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorProfile();
  }, [id]);

  const fetchDoctorProfile = async () => {
    setLoading(true);
    try {
      const response = await doctorService.getDoctorById(id);
      
      if (response.success) {
        setDoctor(response.data.doctor);
        setRecentAppointments(response.data.recentAppointments || []);
      } else {
        toast.error('Failed to fetch doctor profile');
        navigate('/doctors');
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('An error occurred while fetching doctor profile');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
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

  if (!doctor) {
    return (
      <PageContainer>
        <EmptyState>
          <User size={60} />
          <h4>Doctor not found</h4>
          <p>The requested doctor profile could not be found.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton
          onClick={() => navigate('/doctors')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </BackButton>
        <PageTitle>Doctor Profile</PageTitle>
      </Header>

      <ProfileContainer>
        <ProfileCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DoctorAvatar>
            {getInitials(doctor.firstName, doctor.lastName)}
          </DoctorAvatar>
          
          <DoctorName>Dr. {doctor.firstName} {doctor.lastName}</DoctorName>
          <DoctorSpecialization>{doctor.specialization}</DoctorSpecialization>

          <DoctorInfo>
            <InfoRow>
              <Mail size={16} />
              <span>{doctor.email}</span>
            </InfoRow>
            <InfoRow>
              <Phone size={16} />
              <span>{doctor.phone || 'Not provided'}</span>
            </InfoRow>
            <InfoRow>
              <Building size={16} />
              <span>{doctor.department?.name || 'General Practice'}</span>
            </InfoRow>
            <InfoRow>
              <Award size={16} />
              <span>License: {doctor.licenseNumber}</span>
            </InfoRow>
            <InfoRow>
              <MapPin size={16} />
              <span>{doctor.department?.location?.building || 'Main Hospital'}</span>
            </InfoRow>
          </DoctorInfo>

          <StatsSection>
            <StatsGrid>
              <StatCard>
                <StatValue>{doctor.stats?.totalPatients || 0}</StatValue>
                <StatLabel>Patients</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{doctor.stats?.totalAppointments || 0}</StatValue>
                <StatLabel>Appointments</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{doctor.stats?.completionRate || 0}%</StatValue>
                <StatLabel>Completion Rate</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{doctor.stats?.totalRecords || 0}</StatValue>
                <StatLabel>Records</StatLabel>
              </StatCard>
            </StatsGrid>
          </StatsSection>

          {user?.role === 'admin' && (
            <div style={{ marginTop: '20px' }}>
              <ActionButton
                className="primary"
                onClick={() => navigate(`/doctors/${id}/edit`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit size={16} />
                Edit Profile
              </ActionButton>
            </div>
          )}
        </ProfileCard>

        <MainContent>
          <ContentCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CardHeader>
              <CardTitle>
                <Calendar size={20} />
                Recent Appointments
              </CardTitle>
              <ActionButton
                onClick={() => navigate(`/appointments/new?doctorId=${id}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
                Book Appointment
              </ActionButton>
            </CardHeader>

            {recentAppointments.length > 0 ? (
              <AppointmentsList>
                {recentAppointments.map((appointment) => (
                  <AppointmentItem key={appointment._id}>
                    <AppointmentInfo>
                      <AppointmentPatient>
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </AppointmentPatient>
                      <AppointmentDetails>
                        {formatDate(appointment.appointmentDate)} • {appointment.type}
                      </AppointmentDetails>
                    </AppointmentInfo>
                    <AppointmentTime>
                      {appointment.appointmentTime}
                    </AppointmentTime>
                  </AppointmentItem>
                ))}
              </AppointmentsList>
            ) : (
              <EmptyState>
                <Calendar size={40} />
                <h4>No recent appointments</h4>
                <p>This doctor has no recent appointments.</p>
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
                <Activity size={20} />
                Department Information
              </CardTitle>
            </CardHeader>

            {doctor.department ? (
              <div>
                <InfoRow>
                  <Building size={16} />
                  <span>{doctor.department.name} ({doctor.department.code})</span>
                </InfoRow>
                {doctor.department.location && (
                  <>
                    <InfoRow>
                      <MapPin size={16} />
                      <span>
                        {doctor.department.location.building}, 
                        {doctor.department.location.floor}, 
                        {doctor.department.location.wing}
                      </span>
                    </InfoRow>
                  </>
                )}
                {doctor.department.contactInfo && (
                  <>
                    <InfoRow>
                      <Phone size={16} />
                      <span>{doctor.department.contactInfo.phone}</span>
                    </InfoRow>
                    <InfoRow>
                      <Mail size={16} />
                      <span>{doctor.department.contactInfo.email}</span>
                    </InfoRow>
                  </>
                )}
              </div>
            ) : (
              <EmptyState>
                <Building size={40} />
                <h4>No department information</h4>
                <p>Department details are not available.</p>
              </EmptyState>
            )}
          </ContentCard>
        </MainContent>
      </ProfileContainer>
    </PageContainer>
  );
};

export default DoctorProfile;