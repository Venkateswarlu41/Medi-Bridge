import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import billingService from '../services/billing.service';
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 14px;
  font-weight: 500;
`;

const StatTrend = styled.div`
  font-size: 12px;
  color: ${props => props.positive ? '#48bb78' : '#e53e3e'};
  display: flex;
  align-items: center;
  gap: 4px;
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

const BillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const BillCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => getPaymentStatusColor(props.status)};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const BillHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const BillInfo = styled.div`
  flex: 1;
`;

const BillId = styled.div`
  font-size: 14px;
  color: #718096;
  margin-bottom: 5px;
`;

const BillAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BillDate = styled.div`
  font-size: 14px;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getPaymentStatusColor(props.status)}20;
  color: ${props => getPaymentStatusColor(props.status)};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const BillDetails = styled.div`
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

const ServicesSection = styled.div`
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

const ServicesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ServiceItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
`;

const ServiceName = styled.span`
  flex: 1;
  color: #4a5568;
`;

const ServiceAmount = styled.span`
  font-weight: 600;
  color: #2d3748;
`;

const BillActions = styled.div`
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

// Helper function to get payment status color
const getPaymentStatusColor = (status) => {
  const colors = {
    pending: '#ed8936',
    paid: '#48bb78',
    'partially-paid': '#667eea',
    overdue: '#e53e3e',
    refunded: '#a0aec0'
  };
  return colors[status] || '#718096';
};

// Helper function to get payment status icon
const getPaymentStatusIcon = (status) => {
  const icons = {
    pending: Clock,
    paid: CheckCircle,
    'partially-paid': AlertCircle,
    overdue: AlertCircle,
    refunded: CheckCircle
  };
  const Icon = icons[status] || Clock;
  return <Icon size={14} />;
};

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    totalBills: 0,
    overdueAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { hasAnyRole, user } = useAuth();
  const navigate = useNavigate();

  const fetchBills = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchQuery,
        status: statusFilter
      };

      const result = await billingService.getAllBills(params);
      
      if (result.success) {
        setBills(result.data.bills || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotalItems(result.data.pagination?.totalItems || 0);
        setCurrentPage(result.data.pagination?.currentPage || 1);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await billingService.getBillingStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch billing stats:', error);
    }
  };

  useEffect(() => {
    fetchBills(1);
    fetchStats();
  }, [searchQuery, statusFilter]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchBills(page);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handlePayment = async (billId) => {
    try {
      const result = await billingService.processPayment(billId, {
        amount: bills.find(b => b._id === billId)?.totalAmount,
        method: 'card'
      });

      if (result.success) {
        toast.success('Payment processed successfully');
        fetchBills(currentPage);
        fetchStats();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const generateInvoice = async (billId) => {
    try {
      const result = await billingService.generateInvoice(billId);
      if (result.success) {
        // Create download link for PDF
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${billId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Invoice downloaded successfully');
      } else {
        toast.error('Failed to generate invoice');
      }
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  if (loading && bills.length === 0) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading billing information...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <CreditCard size={32} />
          Billing & Invoices ({totalItems})
        </PageTitle>
        
        {hasAnyRole(['admin', 'receptionist']) && (
          <AddButton
            onClick={() => navigate('/billing/new')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Create Bill
          </AddButton>
        )}
      </PageHeader>

      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <StatHeader>
            <StatIcon color="linear-gradient(135deg, #48bb78 0%, #68d391 100%)">
              <DollarSign size={22} color="white" />
            </StatIcon>
          </StatHeader>
          <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon color="linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)">
              <Clock size={22} color="white" />
            </StatIcon>
          </StatHeader>
          <StatValue>{formatCurrency(stats.pendingAmount)}</StatValue>
          <StatLabel>Pending Amount</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <FileText size={22} color="white" />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalBills}</StatValue>
          <StatLabel>Total Bills</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon color="linear-gradient(135deg, #e53e3e 0%, #fc8181 100%)">
              <AlertCircle size={22} color="white" />
            </StatIcon>
          </StatHeader>
          <StatValue>{formatCurrency(stats.overdueAmount)}</StatValue>
          <StatLabel>Overdue Amount</StatLabel>
        </StatCard>
      </StatsContainer>

      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search bills by ID, patient name..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        <FilterSelect value={statusFilter} onChange={handleStatusFilter}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="partially-paid">Partially Paid</option>
          <option value="overdue">Overdue</option>
          <option value="refunded">Refunded</option>
        </FilterSelect>
      </FiltersContainer>

      {bills.length === 0 ? (
        <EmptyState>
          <CreditCard size={64} color="#cbd5e0" />
          <h3>No bills found</h3>
          <p>
            {searchQuery || statusFilter
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first bill'
            }
          </p>
          {hasAnyRole(['admin', 'receptionist']) && (
            <AddButton
              onClick={() => navigate('/billing/new')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Create First Bill
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <>
          <BillsGrid>
            {bills.map((bill) => (
              <BillCard
                key={bill._id}
                status={bill.paymentStatus}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BillHeader>
                  <BillInfo>
                    <BillId>
                      Invoice #{bill.billNumber || bill._id}
                    </BillId>
                    <BillAmount>
                      <DollarSign size={20} />
                      {formatCurrency(bill.totalAmount)}
                    </BillAmount>
                    <BillDate>
                      <Calendar size={14} />
                      {formatDate(bill.billDate || bill.createdAt)}
                    </BillDate>
                  </BillInfo>
                  <StatusBadge status={bill.paymentStatus}>
                    {getPaymentStatusIcon(bill.paymentStatus)}
                    {bill.paymentStatus}
                  </StatusBadge>
                </BillHeader>

                <BillDetails>
                  <DetailRow>
                    <User size={16} />
                    Patient: {bill.patient?.firstName} {bill.patient?.lastName}
                  </DetailRow>
                  {bill.appointment && (
                    <DetailRow>
                      <Calendar size={16} />
                      Appointment: {bill.appointment.appointmentId}
                    </DetailRow>
                  )}
                </BillDetails>

                {bill.services && bill.services.length > 0 && (
                  <ServicesSection>
                    <SectionTitle>
                      <FileText size={16} />
                      Services & Charges
                    </SectionTitle>
                    <ServicesList>
                      {bill.services.slice(0, 3).map((service, index) => (
                        <ServiceItem key={index}>
                          <ServiceName>{service.description}</ServiceName>
                          <ServiceAmount>{formatCurrency(service.amount)}</ServiceAmount>
                        </ServiceItem>
                      ))}
                      {bill.services.length > 3 && (
                        <ServiceItem>
                          <ServiceName>+{bill.services.length - 3} more services</ServiceName>
                          <ServiceAmount>...</ServiceAmount>
                        </ServiceItem>
                      )}
                    </ServicesList>
                  </ServicesSection>
                )}

                <BillActions>
                  <ActionButton
                    onClick={() => navigate(`/billing/${bill._id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye size={16} />
                    View
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => generateInvoice(bill._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download size={16} />
                    Invoice
                  </ActionButton>
                  
                  {bill.paymentStatus === 'pending' && (
                    <ActionButton
                      className="success"
                      onClick={() => handlePayment(bill._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <DollarSign size={16} />
                      Pay Now
                    </ActionButton>
                  )}
                </BillActions>
              </BillCard>
            ))}
          </BillsGrid>

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

export default Billing;