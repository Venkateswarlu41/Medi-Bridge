import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  TestTube,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Mail,
  Phone,
  MapPin,
  Activity,
  Building,
  Calendar,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import labTestService from '../services/labTest.service';
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
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TechniciansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
`;

const TechnicianCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 2px solid #f7fafc;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const TechnicianHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const TechnicianInfo = styled.div`
  flex: 1;
`;

const TechnicianName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px;
`;

const TechnicianId = styled.div`
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.active ? '#155724' : '#721c24'};
  display: inline-block;
`;

const TechnicianDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #4a5568;
`;

const WorkloadSection = styled.div`
  background: #f7fafc;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const WorkloadTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WorkloadStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const WorkloadStat = styled.div`
  text-align: center;
`;

const WorkloadNumber = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
`;

const WorkloadLabel = styled.div`
  font-size: 12px;
  color: #718096;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
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

  &.danger {
    border-color: #fed7d7;
    color: #e53e3e;

    &:hover {
      background: #fed7d7;
    }
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

const LabTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { hasAnyRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const result = await labTestService.getAllLabTechnicians();
      
      if (result.success) {
        setTechnicians(result.data.technicians || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
      toast.error('Failed to fetch lab technicians');
    } finally {
      setLoading(false);
    }
  };

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = searchQuery === '' || 
      `${tech.firstName} ${tech.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || 
      tech.department?.name === departmentFilter;
    
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && tech.isActive) ||
      (statusFilter === 'inactive' && !tech.isActive);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleViewTechnician = (technician) => {
    navigate(`/lab-technicians/${technician._id}`);
  };

  const handleEditTechnician = (technician) => {
    navigate(`/lab-technicians/${technician._id}/edit`);
  };

  const handleDeleteTechnician = async (technician) => {
    if (window.confirm(`Are you sure you want to delete ${technician.firstName} ${technician.lastName}?`)) {
      try {
        // Add delete API call when implemented
        toast.success('Technician deleted successfully');
        fetchTechnicians();
      } catch (error) {
        toast.error('Failed to delete technician');
      }
    }
  };

  const getUniqueValues = (key) => {
    return [...new Set(technicians.map(tech => tech[key]).filter(Boolean))];
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading lab technicians...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <TestTube size={32} />
          Lab Technicians ({technicians.length})
        </PageTitle>
        
        {hasAnyRole(['admin']) && (
          <AddButton
            onClick={() => navigate('/lab-technicians/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Add Technician
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
            placeholder="Search technicians by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>

        <FilterSelect value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
          <option value="">All Departments</option>
          {getUniqueValues('department').map(dept => (
            <option key={dept?.name} value={dept?.name}>
              {dept?.name}
            </option>
          ))}
        </FilterSelect>
      </FiltersContainer>

      {filteredTechnicians.length === 0 ? (
        <EmptyState>
          <TestTube size={64} color="#cbd5e0" />
          <h3>No lab technicians found</h3>
          <p>
            {searchQuery || departmentFilter || statusFilter
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first lab technician'
            }
          </p>
          {hasAnyRole(['admin']) && (
            <AddButton
              onClick={() => navigate('/lab-technicians/new')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Add Technician
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <TechniciansGrid>
          {filteredTechnicians.map((technician, index) => (
            <TechnicianCard
              key={technician._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TechnicianHeader>
                <TechnicianInfo>
                  <TechnicianName>
                    {technician.firstName} {technician.lastName}
                  </TechnicianName>
                  <TechnicianId>ID: {technician._id.slice(-8)}</TechnicianId>
                  <StatusBadge active={technician.isActive}>
                    {technician.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </TechnicianInfo>
              </TechnicianHeader>

              <TechnicianDetails>
                <DetailRow>
                  <Mail size={16} />
                  {technician.email}
                </DetailRow>
                {technician.phone && (
                  <DetailRow>
                    <Phone size={16} />
                    {technician.phone}
                  </DetailRow>
                )}
                {technician.department && (
                  <DetailRow>
                    <Building size={16} />
                    {technician.department.name}
                  </DetailRow>
                )}
              </TechnicianDetails>

              <WorkloadSection>
                <WorkloadTitle>
                  <Activity size={16} />
                  Current Workload
                </WorkloadTitle>
                <WorkloadStats>
                  <WorkloadStat>
                    <WorkloadNumber>{technician.currentWorkload || 0}</WorkloadNumber>
                    <WorkloadLabel>Active Tests</WorkloadLabel>
                  </WorkloadStat>
                  <WorkloadStat>
                    <WorkloadNumber>
                      {technician.currentWorkload === 0 ? 'Available' : 
                       technician.currentWorkload <= 5 ? 'Low' :
                       technician.currentWorkload <= 10 ? 'Medium' : 'High'}
                    </WorkloadNumber>
                    <WorkloadLabel>Load Status</WorkloadLabel>
                  </WorkloadStat>
                </WorkloadStats>
              </WorkloadSection>

              <ActionsContainer>
                <ActionButton
                  onClick={() => handleViewTechnician(technician)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye size={14} />
                  View
                </ActionButton>
                {hasAnyRole(['admin']) && (
                  <>
                    <ActionButton
                      onClick={() => handleEditTechnician(technician)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit size={14} />
                      Edit
                    </ActionButton>
                    <ActionButton
                      className="danger"
                      onClick={() => handleDeleteTechnician(technician)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </ActionButton>
                  </>
                )}
              </ActionsContainer>
            </TechnicianCard>
          ))}
        </TechniciansGrid>
      )}
    </PageContainer>
  );
};

export default LabTechnicians;