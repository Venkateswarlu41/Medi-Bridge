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
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import appointmentService from '../services/appointment.service';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
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
  padding: 12px 15px 12px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const FilterSelect = styled.select`
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const DateInput = styled.input`
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const AppointmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const AppointmentCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => getStatusColor(props.$status)};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const AppointmentInfo = styled.div`
  flex: 1;
`;

const AppointmentId = styled.div`
  font-size: 14px;
  color: #718096;
  margin-bottom: 5px;
`;

const AppointmentTime = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
`;

const AppointmentDate = styled.div`
  font-size: 14px;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const AppointmentDetails = styled.div`
  margin-bottom: 15px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
`;

const AppointmentType = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background: #f7fafc;
  border-radius: 6px;
  font-size: 12px;
  color: #4a5568;
  text-transform: capitalize;
  margin-bottom: 10px;
`;

const ChiefComplaint = styled.div`
  font-size: 14px;
  color: #2d3748;
  background: #f7fafc;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ActionButton = styled(motion.button)`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #4a5568;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
  }

  &.success {
    background: #48bb78;
    color: white;
    border-color: transparent;

    &:hover {
      background: #38a169;
    }
  }

  &.danger {
    background: #e53e3e;
    color: white;
    border-color: transparent;

    &:hover {
      background: #c53030;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
`;

const PaginationButton = styled.button`
  padding: 10px 15px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #4a5568;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #667eea;
    color: #667eea;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #718096;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;

  h3 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #4a5568;
  }

  p {
    font-size: 16px;
    margin-bottom: 20px;
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
    'no-show': '#a0aec0',
    rescheduled: '#9f7aea'
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