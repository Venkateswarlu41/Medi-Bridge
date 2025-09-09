import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  Upload,
  Calendar,
  User,
  Activity,
  Pill,
  TestTube,
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import medicalRecordService from '../services/medicalRecord.service';
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

const RecordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const RecordCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => getRecordTypeColor(props.recordType)};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const RecordInfo = styled.div`
  flex: 1;
`;

const RecordId = styled.div`
  font-size: 14px;
  color: #718096;
  margin-bottom: 5px;
`;

const RecordTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px;
`;

const RecordDate = styled.div`
  font-size: 14px;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const RecordType = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getRecordTypeColor(props.type)}20;
  color: ${props => getRecordTypeColor(props.type)};
`;

const RecordDetails = styled.div`
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

const DiagnosisSection = styled.div`
  background: #f7fafc;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DiagnosisList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DiagnosisItem = styled.li`
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 5px;
  font-size: 14px;
  color: #4a5568;
  border-left: 3px solid #667eea;
`;

const PrescriptionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PrescriptionTag = styled.span`
  background: #e6fffa;
  color: #00695c;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const LabTestsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const LabTestTag = styled.span`
  background: #fff5e6;
  color: #e65100;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const RecordActions = styled.div`
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

  &.success {
    background: #48bb78;
    color: white;
    border-color: transparent;

    &:hover {
      background: #38a169;
    }
  }

  &.warning {
    background: #ed8936;
    color: white;
    border-color: transparent;

    &:hover {
      background: #dd7116;
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

// Helper function to get record type color
const getRecordTypeColor = (type) => {
  const colors = {
    consultation: '#667eea',
    'follow-up': '#48bb78',
    emergency: '#e53e3e',
    'routine-checkup': '#38b2ac',
    procedure: '#ed8936',
    'lab-result': '#9f7aea'
  };
  return colors[type] || '#718096';
};

// Helper function to get record type icon
const getRecordTypeIcon = (type) => {
  const icons = {
    consultation: FileText,
    'follow-up': CheckCircle,
    emergency: AlertCircle,
    'routine-checkup': Heart,
    procedure: Activity,
    'lab-result': TestTube
  };
  const Icon = icons[type] || FileText;
  return <Icon size={14} />;
};

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { hasAnyRole, user } = useAuth();
  const navigate = useNavigate();

  const fetchMedicalRecords = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchQuery,
        type: typeFilter,
        date: dateFilter,
        patientId: patientFilter
      };

      let result;
      if (user?.role === 'patient') {
        // For patients, use the general endpoint which should filter by authenticated user
        result = await medicalRecordService.getMyMedicalRecords(params);
        if (result.success) {
          setRecords(result.data.records || result.data || []);
          setTotalPages(result.data.pagination?.totalPages || Math.ceil((result.data.records?.length || result.data?.length || 0) / 12) || 1);
          setTotalItems(result.data.pagination?.totalItems || result.data.records?.length || result.data?.length || 0);
          setCurrentPage(result.data.pagination?.currentPage || page);
        }
      } else {
        // For admin/doctor, use the general endpoint
        result = await medicalRecordService.getAllMedicalRecords(params);
        if (result.success) {
          setRecords(result.data.records || []);
          setTotalPages(result.data.pagination?.totalPages || 1);
          setTotalItems(result.data.pagination?.totalItems || 0);
          setCurrentPage(result.data.pagination?.currentPage || 1);
        }
      }
      
      if (!result.success) {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords(1);
  }, [searchQuery, typeFilter, dateFilter, patientFilter]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePatientFilter = (e) => {
    setPatientFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMedicalRecords(page);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const downloadRecord = async (recordId) => {
    try {
      // Implementation for downloading record as PDF
      toast.success('Record download started');
    } catch (error) {
      toast.error('Failed to download record');
    }
  };

  if (loading && records.length === 0) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading medical records...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FileText size={32} />
          Medical Records ({totalItems})
          {hasAnyRole(['patient']) && (
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#718096', marginLeft: '10px' }}>
              • Includes completed appointment consultations
            </span>
          )}
        </PageTitle>
        
        {hasAnyRole(['admin', 'doctor']) && (
          <AddButton
            onClick={() => navigate('/medical-records/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            New Record
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
            placeholder="Search medical records..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        <FilterSelect value={typeFilter} onChange={handleTypeFilter}>
          <option value="">All Types</option>
          <option value="consultation">Consultation</option>
          <option value="follow-up">Follow-up</option>
          <option value="emergency">Emergency</option>
          <option value="routine-checkup">Routine Checkup</option>
          <option value="procedure">Procedure</option>
          <option value="lab-result">Lab Result</option>
        </FilterSelect>

        <DateInput
          type="date"
          value={dateFilter}
          onChange={handleDateFilter}
          placeholder="Filter by date"
        />

        {hasAnyRole(['admin', 'doctor']) && (
          <FilterSelect value={patientFilter} onChange={handlePatientFilter}>
            <option value="">All Patients</option>
            {/* Patient options would be loaded dynamically */}
          </FilterSelect>
        )}
      </FiltersContainer>

      {records.length === 0 ? (
        <EmptyState>
          <FileText size={64} color="#cbd5e0" />
          <h3>No medical records found</h3>
          <p>
            {searchQuery || typeFilter || dateFilter
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first medical record'
            }
          </p>
          {hasAnyRole(['admin', 'doctor']) && (
            <AddButton
              onClick={() => navigate('/medical-records/new')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Create First Record
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <>
          <RecordsGrid>
            {records.map((record) => (
              <RecordCard
                key={record._id}
                recordType={record.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RecordHeader>
                  <RecordInfo>
                    <RecordId>
                      ID: {record.recordId || record._id}
                    </RecordId>
                    <RecordTitle>
                      {record.title || (record.recordType === 'consultation' && record.appointment ? 
                        `Appointment Consultation - Dr. ${record.doctor?.firstName} ${record.doctor?.lastName}` : 
                        `${record.recordType} Record`)}
                    </RecordTitle>
                    <RecordDate>
                      <Calendar size={14} />
                      {formatDate(record.visitDate || record.createdAt)}
                    </RecordDate>
                  </RecordInfo>
                  <RecordType type={record.recordType}>
                    {getRecordTypeIcon(record.recordType)}
                    {record.recordType === 'consultation' && record.appointment ? 'Completed Appointment' : record.recordType}
                  </RecordType>
                </RecordHeader>

                <RecordDetails>
                  <DetailRow>
                    <User size={16} />
                    Patient: {record.patient?.firstName} {record.patient?.lastName}
                  </DetailRow>
                  <DetailRow>
                    <User size={16} />
                    Doctor: Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                  </DetailRow>
                </RecordDetails>

                {record.diagnosis && record.diagnosis.length > 0 && (
                  <DiagnosisSection>
                    <SectionTitle>
                      <Activity size={16} />
                      Diagnosis
                    </SectionTitle>
                    <DiagnosisList>
                      {record.diagnosis.slice(0, 2).map((diag, index) => (
                        <DiagnosisItem key={index}>
                          {diag.description}
                        </DiagnosisItem>
                      ))}
                      {record.diagnosis.length > 2 && (
                        <DiagnosisItem>
                          +{record.diagnosis.length - 2} more...
                        </DiagnosisItem>
                      )}
                    </DiagnosisList>
                  </DiagnosisSection>
                )}

                {record.prescriptions && record.prescriptions.length > 0 && (
                  <DiagnosisSection>
                    <SectionTitle>
                      <Pill size={16} />
                      Prescriptions
                    </SectionTitle>
                    <PrescriptionsList>
                      {record.prescriptions.slice(0, 3).map((med, index) => (
                        <PrescriptionTag key={index}>
                          {med.medication}
                        </PrescriptionTag>
                      ))}
                      {record.prescriptions.length > 3 && (
                        <PrescriptionTag>
                          +{record.prescriptions.length - 3}
                        </PrescriptionTag>
                      )}
                    </PrescriptionsList>
                  </DiagnosisSection>
                )}

                {record.labTests && record.labTests.length > 0 && (
                  <DiagnosisSection>
                    <SectionTitle>
                      <TestTube size={16} />
                      Lab Tests
                    </SectionTitle>
                    <LabTestsList>
                      {record.labTests.slice(0, 3).map((test, index) => (
                        <LabTestTag key={index}>
                          {test.testName}
                        </LabTestTag>
                      ))}
                      {record.labTests.length > 3 && (
                        <LabTestTag>
                          +{record.labTests.length - 3}
                        </LabTestTag>
                      )}
                    </LabTestsList>
                  </DiagnosisSection>
                )}

                <RecordActions>
                  <ActionButton
                    onClick={() => navigate(`/medical-records/${record._id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={16} />
                    View
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => downloadRecord(record._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download size={16} />
                    Download
                  </ActionButton>
                  
                  {hasAnyRole(['admin', 'doctor']) && (
                    <ActionButton
                      onClick={() => navigate(`/medical-records/${record._id}/edit`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit size={16} />
                      Edit
                    </ActionButton>
                  )}
                </RecordActions>
              </RecordCard>
            ))}
          </RecordsGrid>

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

export default MedicalRecords;