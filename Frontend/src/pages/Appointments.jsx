import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import appointmentService from '../services/appointment.service';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
  position: relative;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-family-heading);

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-family-button);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 30px rgba(84, 169, 234, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(84, 169, 234, 0.4);
  }
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  margin-bottom: 32px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f9fafb;
  font-family: var(--font-family-body);

  &:focus {
    outline: none;
    border-color: #54a9ea;
    background: white;
    box-shadow: 0 0 0 4px rgba(84, 169, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const FilterSelect = styled.select`
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  background: #f9fafb;
  cursor: pointer;
  font-family: var(--font-family-body);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #54a9ea;
    background: white;
    box-shadow: 0 0 0 4px rgba(84, 169, 234, 0.1);
  }
`;

const DateInput = styled.input`
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  background: #f9fafb;
  cursor: pointer;
  font-family: var(--font-family-body);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #54a9ea;
    background: white;
    box-shadow: 0 0 0 4px rgba(84, 169, 234, 0.1);
  }
`;

const AppointmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AppointmentCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => getStatusColor(props.$status)};
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px rgba(84, 169, 234, 0.12);
    border-color: rgba(84, 169, 234, 0.2);
  }
`;

const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const AppointmentInfo = styled.div`
  flex: 1;
`;

const AppointmentId = styled.div`
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 8px;
  font-weight: 500;
`;

const AppointmentTime = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  font-family: var(--font-family-heading);
`;

const AppointmentDate = styled.div`
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
`;

const StatusBadge = styled.div`
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.$status)};
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(84, 169, 234, 0.3);
  letter-spacing: 0.5px;
`;

const AppointmentDetails = styled.div`
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;

  svg {
    color: #54a9ea;
  }
`;

const AppointmentType = styled.div`
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.1) 0%, rgba(132, 88, 253, 0.1) 100%);
  border: 2px solid rgba(84, 169, 234, 0.2);
  border-radius: 10px;
  font-size: 12px;
  color: #54a9ea;
  text-transform: capitalize;
  margin-bottom: 16px;
  font-weight: 600;
`;

const ChiefComplaint = styled.div`
  font-size: 14px;
  color: #1a1a1a;
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.05) 0%, rgba(132, 88, 253, 0.05) 100%);
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid rgba(84, 169, 234, 0.1);
  line-height: 1.6;

  strong {
    color: #54a9ea;
    font-weight: 600;
  }
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  transition: all 0.3s ease;
  font-weight: 600;
  font-family: var(--font-family-button);

  &:hover {
    border-color: #54a9ea;
    color: #54a9ea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.15);
  }

  &.primary {
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(84, 169, 234, 0.4);
    }
  }

  &.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
  }

  &.danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
  }

  &.secondary {
    background: linear-gradient(135deg, rgba(84, 169, 234, 0.1) 0%, rgba(132, 88, 253, 0.1) 100%);
    color: #54a9ea;
    border-color: rgba(84, 169, 234, 0.3);

    &:hover {
      background: linear-gradient(135deg, rgba(84, 169, 234, 0.2) 0%, rgba(132, 88, 253, 0.2) 100%);
      border-color: #54a9ea;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
`;

const PaginationButton = styled.button`
  padding: 12px 18px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  transition: all 0.3s ease;
  font-weight: 600;
  font-family: var(--font-family-button);

  &:hover:not(:disabled) {
    border-color: #54a9ea;
    color: #54a9ea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.15);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.active {
    background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.3);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: #6b7280;
  background: linear-gradient(135deg, rgba(84, 169, 234, 0.03) 0%, rgba(132, 88, 253, 0.03) 100%);
  border-radius: 20px;
  border: 2px dashed #e5e7eb;

  h3 {
    font-size: 28px;
    margin-bottom: 12px;
    color: #1a1a1a;
    font-weight: 700;
    font-family: var(--font-family-heading);
  }

  p {
    font-size: 16px;
    margin-bottom: 24px;
    color: #6b7280;
  }
`;

// Helper function to get status color
const getStatusColor = (status) => {
  const colors = {
    scheduled: 'linear-gradient(135deg, #54a9ea 0%, #8458fd 100%)',
    confirmed: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'in-progress': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    completed: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    cancelled: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'no-show': 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    rescheduled: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
  };
  return colors[status] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
};

// Helper function to get status icon
const getStatusIcon = (status) => {
  const icons = {
    scheduled: Clock,
    confirmed: CheckCircle,
    'in-progress': AlertCircle,
    completed: CheckCircle,
    cancelled: X,
    'no-show': X,
    rescheduled: Clock
  };
  const Icon = icons[status] || Clock;
  return <Icon size={14} />;
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { hasAnyRole, user } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchQuery,
        status: statusFilter,
        date: dateFilter
      };

      const result = await appointmentService.getAllAppointments(params);
      
      if (result.success) {
        setAppointments(result.data.appointments);
        setTotalPages(result.data.pagination.totalPages);
        setTotalItems(result.data.pagination.totalItems);
        setCurrentPage(result.data.pagination.currentPage);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, [searchQuery, statusFilter, dateFilter]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAppointments(page);
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const result = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      if (result.success) {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointments(currentPage);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const result = await appointmentService.cancelAppointment(appointmentId, 'Cancelled by user');
        
        if (result.success) {
          toast.success('Appointment cancelled successfully');
          fetchAppointments(currentPage);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleDownloadRecord = async (appointmentId) => {
    try {
      const result = await appointmentService.downloadAppointmentRecord(appointmentId);
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

  const formatDateTime = (date, time) => {
    try {
      const appointmentDate = parseISO(date);
      return format(appointmentDate, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading appointments...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <Calendar size={32} />
          Appointments ({totalItems})
        </PageTitle>
        
        {hasAnyRole(['admin', 'doctor', 'patient', 'receptionist']) && (
          <AddButton
            onClick={() => navigate('/appointments/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Book Appointment
          </AddButton>
        )}
      </PageHeader>

      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        <FilterSelect value={statusFilter} onChange={handleStatusFilter}>
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </FilterSelect>

        <DateInput
          type="date"
          value={dateFilter}
          onChange={handleDateFilter}
        />
      </FiltersContainer>

      {appointments.length === 0 ? (
        <EmptyState>
          <Calendar size={64} color="#cbd5e0" />
          <h3>No appointments found</h3>
          <p>
            {searchQuery || statusFilter || dateFilter
              ? 'Try adjusting your search criteria'
              : 'Get started by booking your first appointment'
            }
          </p>
          {hasAnyRole(['admin', 'doctor', 'patient', 'receptionist']) && (
            <AddButton
              onClick={() => navigate('/appointments/new')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Book First Appointment
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <>
          <AppointmentsGrid>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                $status={appointment.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AppointmentHeader>
                  <AppointmentInfo>
                    <AppointmentId>
                      ID: {appointment.appointmentId}
                    </AppointmentId>
                    <AppointmentTime>
                      <Clock size={18} />
                      {appointment.appointmentTime}
                    </AppointmentTime>
                    <AppointmentDate>
                      <Calendar size={16} />
                      {formatDateTime(appointment.appointmentDate)}
                    </AppointmentDate>
                  </AppointmentInfo>
                  <StatusBadge $status={appointment.status}>
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </StatusBadge>
                </AppointmentHeader>

                <AppointmentType>
                  {appointment.type}
                </AppointmentType>

                <AppointmentDetails>
                  <DetailRow>
                    <User size={16} />
                    Patient: {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </DetailRow>
                  <DetailRow>
                    <UserCheck size={16} />
                    Doctor: {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                  </DetailRow>
                </AppointmentDetails>

                {appointment.chiefComplaint && (
                  <ChiefComplaint>
                    <strong>Chief Complaint:</strong> {appointment.chiefComplaint}
                  </ChiefComplaint>
                )}

                <AppointmentActions>
                  <ActionButton
                    onClick={() => navigate(`/appointments/${appointment._id}`, { 
                      state: { appointment } 
                    })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={16} />
                    View
                  </ActionButton>

                  {appointment.status === 'completed' && (
                    <ActionButton
                      className="secondary"
                      onClick={() => handleDownloadRecord(appointment._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={16} />
                      Download
                    </ActionButton>
                  )}
                  
                  {hasAnyRole(['admin', 'doctor']) && appointment.status === 'scheduled' && (
                    <ActionButton
                      className="success"
                      onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckCircle size={16} />
                      Confirm
                    </ActionButton>
                  )}
                  
                  {hasAnyRole(['admin', 'doctor']) && appointment.status === 'confirmed' && (
                    <ActionButton
                      className="primary"
                      onClick={() => handleStatusUpdate(appointment._id, 'in-progress')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AlertCircle size={16} />
                      Start
                    </ActionButton>
                  )}
                  
                  {['scheduled', 'confirmed'].includes(appointment.status) && (
                    <ActionButton
                      className="danger"
                      onClick={() => handleCancelAppointment(appointment._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={16} />
                      Cancel
                    </ActionButton>
                  )}
                </AppointmentActions>
              </AppointmentCard>
            ))}
          </AppointmentsGrid>

          {totalPages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </PaginationButton>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationButton
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationButton>
                );
              })}

              <PaginationButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default Appointments;