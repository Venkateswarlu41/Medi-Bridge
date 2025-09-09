import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Building,
  Search,
  Plus,
  Eye,
  Edit,
  Users,
  Activity,
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import departmentService from '../services/department.service';
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

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-bottom: 30px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;

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

const DepartmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const DepartmentCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid ${props => props.color || '#667eea'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const DepartmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const DepartmentInfo = styled.div`
  flex: 1;
`;

const DepartmentName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px;
`;

const DepartmentDescription = styled.p`
  font-size: 14px;
  color: #718096;
  margin: 0 0 15px;
  line-height: 1.5;
`;

const DepartmentIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 15px;
  background: #f7fafc;
  border-radius: 10px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #718096;
`;

const DepartmentDetails = styled.div`
  margin-bottom: 20px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
`;

const DetailLabel = styled.span`
  color: #718096;
`;

const DetailValue = styled.span`
  color: #2d3748;
  font-weight: 500;
`;

const DepartmentActions = styled.div`
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

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { hasAnyRole } = useAuth();
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const result = await departmentService.getAllDepartments({
        search: searchQuery
      });
      
      if (result.success) {
        setDepartments(result.data.departments || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getDepartmentColor = (name) => {
    const colors = {
      'Cardiology': '#e53e3e',
      'Emergency': '#ed8936',
      'Pediatrics': '#48bb78',
      'Orthopedics': '#667eea',
      'Neurology': '#9f7aea',
      'Oncology': '#38b2ac',
      'Radiology': '#d53f8c'
    };
    return colors[name] || '#667eea';
  };

  const getDepartmentIcon = () => {
    return <Building size={24} color="white" />;
  };

  if (loading && departments.length === 0) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading departments...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <Building size={32} />
          Departments ({departments.length})
        </PageTitle>
        
        {hasAnyRole(['admin']) && (
          <AddButton
            onClick={() => navigate('/departments/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Add Department
          </AddButton>
        )}
      </PageHeader>

      <SearchContainer>
        <SearchIcon>
          <Search size={18} />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </SearchContainer>

      {departments.length === 0 ? (
        <EmptyState>
          <Building size={64} color="#cbd5e0" />
          <h3>No departments found</h3>
          <p>
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first department'
            }
          </p>
          {hasAnyRole(['admin']) && (
            <AddButton
              onClick={() => navigate('/departments/new')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Add First Department
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <DepartmentsGrid>
          {departments.map((department, index) => (
            <DepartmentCard
              key={department._id}
              color={getDepartmentColor(department.name)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <DepartmentHeader>
                <DepartmentInfo>
                  <DepartmentName>{department.name}</DepartmentName>
                  <DepartmentDescription>
                    {department.description || 'No description available'}
                  </DepartmentDescription>
                </DepartmentInfo>
                <DepartmentIcon color={getDepartmentColor(department.name)}>
                  {getDepartmentIcon()}
                </DepartmentIcon>
              </DepartmentHeader>

              <StatsContainer>
                <StatItem>
                  <StatValue>{department.stats?.totalDoctors || 0}</StatValue>
                  <StatLabel>Doctors</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{department.stats?.totalPatients || 0}</StatValue>
                  <StatLabel>Patients</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{department.stats?.todayAppointments || 0}</StatValue>
                  <StatLabel>Today</StatLabel>
                </StatItem>
              </StatsContainer>

              <DepartmentDetails>
                <DetailRow>
                  <DetailLabel>Department Head:</DetailLabel>
                  <DetailValue>
                    {department.head 
                      ? `Dr. ${department.head.firstName} ${department.head.lastName}` 
                      : 'Not assigned'
                    }
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Location:</DetailLabel>
                  <DetailValue>{department.location || 'Not specified'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Phone:</DetailLabel>
                  <DetailValue>{department.phone || 'Not provided'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Status:</DetailLabel>
                  <DetailValue style={{ 
                    color: department.isActive ? '#48bb78' : '#e53e3e',
                    fontWeight: 600 
                  }}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </DetailValue>
                </DetailRow>
              </DepartmentDetails>

              <DepartmentActions>
                <ActionButton
                  onClick={() => navigate(`/departments/${department._id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye size={16} />
                  View
                </ActionButton>
                
                <ActionButton
                  onClick={() => navigate(`/departments/${department._id}/doctors`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users size={16} />
                  Staff
                </ActionButton>
                
                {hasAnyRole(['admin']) && (
                  <ActionButton
                    onClick={() => navigate(`/departments/${department._id}/edit`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit size={16} />
                    Edit
                  </ActionButton>
                )}
                
                <ActionButton
                  className="primary"
                  onClick={() => navigate(`/appointments/new?departmentId=${department._id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar size={16} />
                  Book
                </ActionButton>
              </DepartmentActions>
            </DepartmentCard>
          ))}
        </DepartmentsGrid>
      )}
    </PageContainer>
  );
};

export default Departments;