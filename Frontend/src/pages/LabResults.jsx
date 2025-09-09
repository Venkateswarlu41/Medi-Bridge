import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  TestTube,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Clock
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

const ResultsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const TestResultCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => getStatusColor(props.$status)};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
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

const TestMeta = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4a5568;
  font-size: 14px;
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

const ResultsSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResultsTable = styled.div`
  background: #f7fafc;
  border-radius: 10px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  padding: 12px 15px;
  background: #e2e8f0;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 5px;
  }
`;

const ResultRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 120px;
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const ParameterName = styled.div`
  font-weight: 500;
  color: #2d3748;
`;

const ResultValue = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const NormalRange = styled.div`
  color: #718096;
  font-size: 14px;
`;

const Unit = styled.div`
  color: #4a5568;
  font-size: 14px;
`;

const ResultStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => getResultStatusColor(props.$status)};
`;

const InterpretationSection = styled.div`
  background: #f7fafc;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const InterpretationText = styled.div`
  color: #4a5568;
  line-height: 1.6;
`;

const ConclusionSection = styled.div`
  background: #e6fffa;
  border: 2px solid #81e6d9;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const RecommendationsSection = styled.div`
  background: #fef5e7;
  border: 2px solid #fbd38d;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #718096;
`;

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    completed: '#48bb78',
    reviewed: '#38b2ac',
    'in-progress': '#ed8936',
    assigned: '#667eea',
    cancelled: '#e53e3e'
  };
  return colors[status] || '#718096';
};

const getResultStatusColor = (status) => {
  const colors = {
    normal: '#48bb78',
    abnormal: '#ed8936',
    critical: '#e53e3e',
    inconclusive: '#718096'
  };
  return colors[status] || '#718096';
};

const getResultStatusIcon = (status) => {
  const icons = {
    normal: CheckCircle,
    abnormal: AlertTriangle,
    critical: AlertTriangle,
    inconclusive: Minus
  };
  const Icon = icons[status] || CheckCircle;
  return <Icon size={16} />;
};

const LabResults = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('completed,reviewed');
  const [testTypeFilter, setTestTypeFilter] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLabResults();
  }, [statusFilter, testTypeFilter]);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      
      const params = {
        status: statusFilter,
        testType: testTypeFilter
      };

      const result = await labTestService.getAllLabTests(params);
      
      if (result.success) {
        // Filter only tests with results
        const testsWithResults = result.data.labTests?.filter(test => 
          test.results && (test.results.values?.length > 0 || test.results.conclusion)
        ) || [];
        setLabTests(testsWithResults);
      } else {
        toast.error(result.message || 'Failed to fetch lab results');
      }
    } catch (error) {
      console.error('Fetch lab results error:', error);
      toast.error('Failed to fetch lab results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadResult = async (testId) => {
    try {
      // Implementation for downloading result as PDF
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download result');
    }
  };

  const filteredTests = labTests.filter(test =>
    test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.testId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading lab results...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <TestTube size={32} />
          My Lab Results ({filteredTests.length})
        </PageTitle>
      </PageHeader>

      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search lab results..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="completed,reviewed">All Results</option>
          <option value="completed">Completed</option>
          <option value="reviewed">Reviewed</option>
        </FilterSelect>

        <FilterSelect value={testTypeFilter} onChange={(e) => setTestTypeFilter(e.target.value)}>
          <option value="">All Test Types</option>
          <option value="blood">Blood Test</option>
          <option value="urine">Urine Test</option>
          <option value="imaging">Imaging</option>
          <option value="pathology">Pathology</option>
          <option value="microbiology">Microbiology</option>
          <option value="biochemistry">Biochemistry</option>
          <option value="hematology">Hematology</option>
          <option value="other">Other</option>
        </FilterSelect>
      </FiltersContainer>

      {filteredTests.length === 0 ? (
        <EmptyState>
          <TestTube size={64} color="#cbd5e0" />
          <h3>No lab results found</h3>
          <p>
            {searchQuery || testTypeFilter
              ? 'Try adjusting your search criteria'
              : 'Your completed lab test results will appear here'}
          </p>
        </EmptyState>
      ) : (
        <ResultsGrid>
          {filteredTests.map((test, index) => (
            <TestResultCard
              key={test._id}
              $status={test.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardHeader>
                <TestInfo>
                  <TestName>{test.testName}</TestName>
                  <TestId>Test ID: {test.testId}</TestId>
                  <TestMeta>
                    <MetaItem>
                      <Calendar size={14} />
                      Completed: {test.completedDate && format(parseISO(test.completedDate), 'MMM dd, yyyy')}
                    </MetaItem>
                    <MetaItem>
                      <User size={14} />
                      Doctor: Dr. {test.doctor?.firstName} {test.doctor?.lastName}
                    </MetaItem>
                  </TestMeta>
                </TestInfo>
                <StatusBadge $status={test.status}>
                  {test.status === 'reviewed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {test.status === 'reviewed' ? 'Reviewed' : 'Completed'}
                </StatusBadge>
              </CardHeader>

              {/* Test Results Table */}
              {test.results && test.results.values && test.results.values.length > 0 && (
                <ResultsSection>
                  <SectionTitle>
                    <Activity size={16} />
                    Test Results
                  </SectionTitle>
                  <ResultsTable>
                    <TableHeader>
                      <div>Parameter</div>
                      <div>Value</div>
                      <div>Unit</div>
                      <div>Normal Range</div>
                      <div>Status</div>
                    </TableHeader>
                    {test.results.values.map((result, idx) => (
                      <ResultRow key={idx}>
                        <ParameterName>{result.parameter}</ParameterName>
                        <ResultValue>{result.value}</ResultValue>
                        <Unit>{result.unit || '-'}</Unit>
                        <NormalRange>{result.normalRange || '-'}</NormalRange>
                        <ResultStatus $status={result.status}>
                          {getResultStatusIcon(result.status)}
                          {result.status}
                        </ResultStatus>
                      </ResultRow>
                    ))}
                  </ResultsTable>
                </ResultsSection>
              )}

              {/* Interpretation */}
              {test.results?.interpretation && (
                <InterpretationSection>
                  <SectionTitle>
                    <FileText size={16} />
                    Interpretation
                  </SectionTitle>
                  <InterpretationText>{test.results.interpretation}</InterpretationText>
                </InterpretationSection>
              )}

              {/* Conclusion */}
              {test.results?.conclusion && (
                <ConclusionSection>
                  <SectionTitle style={{ color: '#00695c', margin: '0 0 10px' }}>
                    <CheckCircle size={16} />
                    Conclusion
                  </SectionTitle>
                  <div style={{ color: '#00695c' }}>{test.results.conclusion}</div>
                </ConclusionSection>
              )}

              {/* Recommendations */}
              {test.results?.recommendations && (
                <RecommendationsSection>
                  <SectionTitle style={{ color: '#c05621', margin: '0 0 10px' }}>
                    <AlertTriangle size={16} />
                    Recommendations
                  </SectionTitle>
                  <div style={{ color: '#c05621' }}>{test.results.recommendations}</div>
                </RecommendationsSection>
              )}

              {/* Doctor Review */}
              {test.doctorReview?.reviewed && test.doctorReview.comments && (
                <InterpretationSection>
                  <SectionTitle>
                    <User size={16} />
                    Doctor's Review
                  </SectionTitle>
                  <InterpretationText>
                    <strong>Review:</strong> {test.doctorReview.comments}
                    {test.doctorReview.actionTaken && (
                      <div style={{ marginTop: '8px' }}>
                        <strong>Action Taken:</strong> {test.doctorReview.actionTaken}
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#718096' }}>
                      Reviewed on {format(parseISO(test.doctorReview.reviewedAt), 'MMM dd, yyyy hh:mm a')}
                    </div>
                  </InterpretationText>
                </InterpretationSection>
              )}

              <ActionButtons>
                <ActionButton
                  onClick={() => navigate(`/lab-tests/${test._id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye size={16} />
                  View Details
                </ActionButton>
                
                <ActionButton
                  onClick={() => handleDownloadResult(test._id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={16} />
                  Download
                </ActionButton>
              </ActionButtons>
            </TestResultCard>
          ))}
        </ResultsGrid>
      )}
    </PageContainer>
  );
};

export default LabResults;