import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  TestTube,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  Activity,
  AlertCircle,
  User,
  Calendar,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import labTestService from '../services/labTest.service';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 12px 15px 12px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  width: 250px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 15px;
  color: #718096;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }

  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const RefreshButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 15px;
  min-width: 200px;
  z-index: 10;
`;

const FilterGroup = styled.div`
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.div`
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TestsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const TestCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
  }
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const TestInfo = styled.div`
  flex: 1;
`;

const TestName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px;
`;

const TestId = styled.div`
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
`;

const StatusBadge = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStatusColor(props.$status)}20;
  color: ${props => getStatusColor(props.$status)};
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const TestDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-size: 14px;
`;

const DetailLabel = styled.span`
  color: #718096;
`;

const DetailValue = styled.span`
  font-weight: 500;
  color: #2d3748;
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getPriorityColor(props.$priority)}20;
  color: ${props => getPriorityColor(props.$priority)};
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;
  
  h3 {
    margin: 20px 0 10px;
    color: #4a5568;
  }
  
  p {
    margin: 0;
    font-size: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #718096;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

// Helper functions
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

const getPriorityColor = (priority) => {
  const colors = {
    routine: '#48bb78',
    urgent: '#ed8936',
    stat: '#e53e3e'
  };
  return colors[priority] || '#718096';
};

const getStatusIcon = (status) => {
  const icons = {
    assigned: Clock,
    'in-progress': Activity,
    completed: CheckCircle,
    reviewed: CheckCircle,
    cancelled: AlertCircle
  };
  const Icon = icons[status] || Clock;
  return <Icon size={14} />;
};

const LabTests = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasAnyRole } = useAuth();

  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    testType: '',
    priority: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchLabTests();
  }, [currentPage, filters]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };

      // Add search term if exists
      if (searchTerm) {
        params.search = searchTerm;
      }

      const result = await labTestService.getAllLabTests(params);
      
      if (result.success) {
        setLabTests(result.data.labTests || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        toast.error(result.message || 'Failed to fetch lab tests');
      }
    } catch (error) {
      console.error('Fetch lab tests error:', error);
      toast.error('Failed to fetch lab tests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchLabTests();
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters({
      ...filters,
      [filterKey]: value
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLabTests();
  };

  const handleTestClick = (test) => {
    navigate(`/lab-tests/${test._id}`);
  };

  const filteredTests = labTests.filter(test => 
    test.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading lab tests...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>
          <TestTube size={40} />
          Lab Tests
        </Title>
        <Controls>
          <SearchContainer>
            <SearchIcon>
              <Search size={18} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search tests, patients, or test ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
            />
          </SearchContainer>
          
          <div style={{ position: 'relative' }}>
            <FilterButton
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'active' : ''}
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} />
            </FilterButton>
            
            {showFilters && (
              <FilterDropdown>
                <FilterGroup>
                  <FilterLabel>Status</FilterLabel>
                  <FilterSelect
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="reviewed">Reviewed</option>
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Test Type</FilterLabel>
                  <FilterSelect
                    value={filters.testType}
                    onChange={(e) => handleFilterChange('testType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="blood">Blood Test</option>
                    <option value="urine">Urine Test</option>
                    <option value="imaging">Imaging</option>
                    <option value="pathology">Pathology</option>
                    <option value="microbiology">Microbiology</option>
                    <option value="biochemistry">Biochemistry</option>
                    <option value="hematology">Hematology</option>
                    <option value="other">Other</option>
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Priority</FilterLabel>
                  <FilterSelect
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                  >
                    <option value="">All Priorities</option>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </FilterSelect>
                </FilterGroup>
              </FilterDropdown>
            )}
          </div>
          
          <RefreshButton
            onClick={handleRefresh}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </RefreshButton>
        </Controls>
      </Header>

      <TestsGrid>
        {filteredTests.length > 0 ? (
          filteredTests.map((test, index) => (
            <TestCard
              key={test._id}
              onClick={() => handleTestClick(test)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TestHeader>
                <TestInfo>
                  <TestName>{test.testName}</TestName>
                  <TestId>Test ID: {test.testId}</TestId>
                </TestInfo>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <StatusBadge $status={test.status}>
                    {getStatusIcon(test.status)}
                    {test.status}
                  </StatusBadge>
                  <PriorityBadge $priority={test.priority}>
                    {test.priority}
                  </PriorityBadge>
                </div>
              </TestHeader>

              <TestDetails>
                <DetailItem>
                  <User size={16} />
                  <DetailLabel>Patient:</DetailLabel>
                  <DetailValue>
                    {test.patient?.firstName} {test.patient?.lastName}
                  </DetailValue>
                </DetailItem>
                
                <DetailItem>
                  <TestTube size={16} />
                  <DetailLabel>Type:</DetailLabel>
                  <DetailValue style={{ textTransform: 'capitalize' }}>
                    {test.testType}
                  </DetailValue>
                </DetailItem>
                
                <DetailItem>
                  <Calendar size={16} />
                  <DetailLabel>Requested:</DetailLabel>
                  <DetailValue>
                    {format(parseISO(test.requestDate), 'MMM dd, yyyy')}
                  </DetailValue>
                </DetailItem>
              </TestDetails>

              {test.clinicalIndication && (
                <div style={{ 
                  background: '#f7fafc', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '15px' 
                }}>
                  <DetailLabel style={{ display: 'block', marginBottom: '4px' }}>
                    Clinical Indication:
                  </DetailLabel>
                  <DetailValue>{test.clinicalIndication}</DetailValue>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {test.assignedTechnician && (
                    <DetailItem>
                      <User size={14} />
                      <DetailValue style={{ fontSize: '14px' }}>
                        {test.assignedTechnician.firstName} {test.assignedTechnician.lastName}
                      </DetailValue>
                    </DetailItem>
                  )}
                </div>
                
                <ActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestClick(test);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye size={16} />
                  View Details
                </ActionButton>
              </div>
            </TestCard>
          ))
        ) : (
          <EmptyState>
            <TestTube size={64} color="#cbd5e0" />
            <h3>No lab tests found</h3>
            <p>
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search or filters'
                : 'Lab tests will appear here when they are assigned to you'}
            </p>
          </EmptyState>
        )}
      </TestsGrid>

      {totalPages > 1 && (
        <Pagination>
          <PaginationButton
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PaginationButton>
          
          {[...Array(Math.min(5, totalPages))].map((_, index) => {
            const pageNumber = Math.max(1, Math.min(totalPages, currentPage - 2 + index));
            return (
              <PaginationButton
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={currentPage === pageNumber ? 'active' : ''}
              >
                {pageNumber}
              </PaginationButton>
            );
          })}
          
          <PaginationButton
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </PaginationButton>
        </Pagination>
      )}
    </PageContainer>
  );
};

export default LabTests;