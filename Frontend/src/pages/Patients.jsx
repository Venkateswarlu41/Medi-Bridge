import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  Heart,
  Activity,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import patientService from '../services/patient.service';
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

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const PatientCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const PatientAvatar = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 20px;
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px;
`;

const PatientId = styled.div`
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 5px;
`;

const PatientAge = styled.div`
  font-size: 12px;
  color: #718096;
`;

const PatientDetails = styled.div`
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
`;

const BloodGroup = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background: #e53e3e20;
  color: #e53e3e;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
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
  background: #f7fafc;
  border-radius: 10px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #718096;
`;

const PatientActions = styled.div`
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

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchQuery,
        gender: genderFilter,
        bloodGroup: bloodGroupFilter
      };

      const result = await patientService.getAllPatients(params);
      
      if (result.success) {
        setPatients(result.data.patients || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotalItems(result.data.pagination?.totalItems || 0);
        setCurrentPage(result.data.pagination?.currentPage || 1);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1);
  }, [searchQuery, genderFilter, bloodGroupFilter]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleGenderFilter = (e) => {
    setGenderFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleBloodGroupFilter = (e) => {
    setBloodGroupFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPatients(page);
  };

  const getPatientInitials = (patient) => {
    return `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const birth = parseISO(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} years`;
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading && patients.length === 0) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading patients...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <Users size={32} />
          Patients ({totalItems})
        </PageTitle>
        
        {hasAnyRole(['admin', 'doctor', 'nurse', 'receptionist']) && (
          <AddButton
            onClick={() => navigate('/patients/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Add Patient
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
            placeholder="Search patients by name, ID, or contact..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        <FilterSelect value={genderFilter} onChange={handleGenderFilter}>
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </FilterSelect>

        <FilterSelect value={bloodGroupFilter} onChange={handleBloodGroupFilter}>
          <option value="">All Blood Groups</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </FilterSelect>
      </FiltersContainer>

      {patients.length === 0 ? (
        <EmptyState>
          <Users size={64} color="#cbd5e0" />
          <h3>No patients found</h3>
          <p>
            {searchQuery || genderFilter || bloodGroupFilter
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first patient'
            }
          </p>
          {hasAnyRole(['admin', 'doctor', 'nurse', 'receptionist']) && (
            <AddButton
              onClick={() => navigate('/patients/new')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Add First Patient
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <>
          <PatientsGrid>
            {patients.map((patient) => (
              <PatientCard
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PatientHeader>
                  <PatientAvatar>
                    {getPatientInitials(patient)}
                  </PatientAvatar>
                  <PatientInfo>
                    <PatientName>
                      {patient.firstName} {patient.lastName}
                    </PatientName>
                    <PatientId>
                      ID: {patient.patientId}
                    </PatientId>
                    <PatientAge>
                      {calculateAge(patient.dateOfBirth)} • {patient.gender}
                    </PatientAge>
                  </PatientInfo>
                </PatientHeader>

                {patient.bloodGroup && (
                  <BloodGroup>
                    <Heart size={12} />
                    {patient.bloodGroup}
                  </BloodGroup>
                )}

                <PatientDetails>
                  <DetailRow>
                    <Phone size={16} />
                    {patient.phone || 'N/A'}
                  </DetailRow>
                  <DetailRow>
                    <Mail size={16} />
                    {patient.email}
                  </DetailRow>
                  {patient.address && (
                    <DetailRow>
                      <MapPin size={16} />
                      {patient.address.street}, {patient.address.city}
                    </DetailRow>
                  )}
                </PatientDetails>

                <StatsContainer>
                  <StatItem>
                    <StatValue>{patient.stats?.totalAppointments || 0}</StatValue>
                    <StatLabel>Appointments</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{patient.stats?.totalRecords || 0}</StatValue>
                    <StatLabel>Records</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{patient.stats?.lastVisit || 'Never'}</StatValue>
                    <StatLabel>Last Visit</StatLabel>
                  </StatItem>
                </StatsContainer>

                <PatientActions>
                  <ActionButton
                    onClick={() => navigate(`/patients/${patient._id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={16} />
                    View
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => navigate(`/patients/${patient._id}/edit`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit size={16} />
                    Edit
                  </ActionButton>
                  
                  <ActionButton
                    className="primary"
                    onClick={() => navigate(`/appointments/new?patientId=${patient._id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Calendar size={16} />
                    Book
                  </ActionButton>
                </PatientActions>
              </PatientCard>
            ))}
          </PatientsGrid>

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

export default Patients;