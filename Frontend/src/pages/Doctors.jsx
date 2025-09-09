import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  Eye,
  Calendar,
  Phone,
  Mail,
  Award,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import doctorService from '../services/doctor.service';
import { useAuth } from '../context/AuthContext';

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
  color: var(--gray-800);
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
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const FiltersContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: var(--shadow-sm);
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
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
`;

const FilterSelect = styled.select`
  padding: 12px 15px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const DoctorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const DoctorCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const DoctorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const DoctorAvatar = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 20px;
`;

const DoctorInfo = styled.div`
  flex: 1;
`;

const DoctorName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-800);
  margin: 0 0 5px;
`;

const DoctorSpecialization = styled.div`
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 5px;
`;

const DoctorId = styled.div`
  font-size: 12px;
  color: var(--gray-500);
`;

const DoctorDetails = styled.div`
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--gray-600);
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 12px;
  background: var(--gray-50);
  border-radius: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--gray-100);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--gray-500);
`;

const DoctorActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ActionButton = styled(motion.button)`
  padding: 8px 12px;
  border: 2px solid var(--gray-200);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--gray-600);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    border-color: transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
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
  border: 2px solid var(--gray-200);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--gray-600);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    border-color: transparent;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--gray-500);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--gray-500);

  svg {
    margin-bottom: 20px;
    color: var(--gray-400);
  }

  h3 {
    margin: 0 0 10px;
    color: var(--gray-700);
  }

  p {
    margin: 0;
    font-size: 16px;
  }
`;

const Doctors = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [specialties, setSpecialties] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchFilters();
  }, [currentPage, searchQuery, specialtyFilter, departmentFilter]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 6,
        search: searchQuery,
        specialization: specialtyFilter,
        departmentId: departmentFilter
      };

      const response = await doctorService.getAllDoctors(params);
      
      if (response.success) {
        setDoctors(response.data.doctors);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('An error occurred while fetching doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      // In a real app, these would be fetched from the API
      setSpecialties([
        'Cardiology',
        'Neurology',
        'Pediatrics',
        'Orthopedics',
        'Dermatology',
        'Ophthalmology',
        'Gynecology',
        'Oncology'
      ]);
      
      setDepartments([
        'Emergency',
        'Outpatient',
        'Inpatient',
        'Surgery',
        'Radiology',
        'Laboratory',
        'Pharmacy',
        'Rehabilitation'
      ]);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSpecialtyChange = (e) => {
    setSpecialtyFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (e) => {
    setDepartmentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAddDoctor = () => {
    navigate('/doctors/new');
  };

  const handleViewDoctor = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  const handleScheduleAppointment = (doctorId) => {
    navigate(`/appointments/new?doctorId=${doctorId}`);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    pages.push(
      <PaginationButton 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
        Previous
      </PaginationButton>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationButton 
          key={i} 
          className={currentPage === i ? 'active' : ''}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PaginationButton>
      );
    }

    pages.push(
      <PaginationButton 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight size={16} />
      </PaginationButton>
    );

    return pages;
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <UserCheck size={32} color="var(--primary-color)" />
          Doctors
        </PageTitle>
        {user?.role === 'admin' && (
          <AddButton 
            onClick={handleAddDoctor}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Add Doctor
          </AddButton>
        )}
      </PageHeader>

      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search doctors by name or ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        <FilterSelect 
          value={specialtyFilter} 
          onChange={handleSpecialtyChange}
        >
          <option value="">All Specialties</option>
          {specialties.map((specialty, index) => (
            <option key={index} value={specialty}>{specialty}</option>
          ))}
        </FilterSelect>

        <FilterSelect 
          value={departmentFilter} 
          onChange={handleDepartmentChange}
        >
          <option value="">All Departments</option>
          {departments.map((department, index) => (
            <option key={index} value={department}>{department}</option>
          ))}
        </FilterSelect>
      </FiltersContainer>

      {loading ? (
        <LoadingContainer>
          Loading doctors...
        </LoadingContainer>
      ) : doctors.length > 0 ? (
        <>
          <DoctorsGrid>
            {doctors.map((doctor) => (
              <DoctorCard 
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DoctorHeader>
                  <DoctorAvatar>
                    {getInitials(doctor.firstName, doctor.lastName)}
                  </DoctorAvatar>
                  <DoctorInfo>
                    <DoctorName>Dr. {doctor.firstName} {doctor.lastName}</DoctorName>
                    <DoctorSpecialization>{doctor.specialization}</DoctorSpecialization>
                    <DoctorId>ID: {doctor._id}</DoctorId>
                  </DoctorInfo>
                </DoctorHeader>

                <DoctorDetails>
                  <DetailRow>
                    <Building size={16} />
                    {doctor.department?.name || 'General Practice'}
                  </DetailRow>
                  <DetailRow>
                    <Mail size={16} />
                    {doctor.email}
                  </DetailRow>
                  <DetailRow>
                    <Phone size={16} />
                    {doctor.phone || 'Not provided'}
                  </DetailRow>
                </DoctorDetails>

                <StatsContainer>
                  <StatItem>
                    <StatValue>{doctor.stats?.totalPatients || '0'}</StatValue>
                    <StatLabel>Patients</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{doctor.stats?.todayAppointments || '0'}</StatValue>
                    <StatLabel>Today</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{doctor.stats?.totalRecords || '0'}</StatValue>
                    <StatLabel>Records</StatLabel>
                  </StatItem>
                </StatsContainer>

                <DoctorActions>
                  <ActionButton 
                    onClick={() => handleViewDoctor(doctor._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={16} />
                    View Profile
                  </ActionButton>
                  <ActionButton 
                    className="primary"
                    onClick={() => handleScheduleAppointment(doctor._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Calendar size={16} />
                    Schedule
                  </ActionButton>
                </DoctorActions>
              </DoctorCard>
            ))}
          </DoctorsGrid>

          <Pagination>
            {renderPagination()}
          </Pagination>
        </>
      ) : (
        <EmptyState>
          <UserCheck size={60} />
          <h3>No doctors found</h3>
          <p>Try adjusting your search or filters</p>
        </EmptyState>
      )}
    </PageContainer>
  );
};

export default Doctors;