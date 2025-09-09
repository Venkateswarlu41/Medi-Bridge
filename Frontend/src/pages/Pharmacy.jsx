import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Pill,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Calendar,
  User,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import pharmacyService from '../services/pharmacy.service';
import dashboardService from '../services/dashboard.service';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import AskAIChatbot from '../components/chatbot/AskAIChatbot';

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

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 12px 20px;
  border: none;
  background: none;
  font-weight: 600;
  color: ${props => props.active ? '#667eea' : '#718096'};
  border-bottom: 3px solid ${props => props.active ? '#667eea' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
  }
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

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ItemCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => getStockStatusColor(props.stockStatus)};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 5px;
`;

const ItemBrand = styled.div`
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 5px;
`;

const ItemCode = styled.div`
  font-size: 12px;
  color: #718096;
`;

const StockBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => getStockStatusColor(props.status)}20;
  color: ${props => getStockStatusColor(props.status)};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ItemDetails = styled.div`
  margin-bottom: 15px;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
`;

const DetailItem = styled.div`
  background: #f7fafc;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
`;

const DetailValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  color: #718096;
`;

const ItemDescription = styled.div`
  font-size: 14px;
  color: #4a5568;
  background: #f7fafc;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
`;

const ItemActions = styled.div`
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

  &.warning {
    background: #ed8936;
    color: white;
    border-color: transparent;

    &:hover {
      background: #dd7116;
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

// Helper function to get stock status color
const getStockStatusColor = (status) => {
  if (status === 'out-of-stock') return '#e53e3e';
  if (status === 'low-stock') return '#ed8936';
  if (status === 'in-stock') return '#48bb78';
  return '#718096';
};

// Helper function to get stock status icon
const getStockStatusIcon = (status) => {
  if (status === 'out-of-stock') return <AlertTriangle size={14} />;
  if (status === 'low-stock') return <TrendingDown size={14} />;
  if (status === 'in-stock') return <CheckCircle size={14} />;
  return <Package size={14} />;
};

const AskAISection = styled.div`
  margin-top: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Pharmacy = () => {
  const [activeTab, setActiveTab] = useState('medications');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalMedications: 0,
    lowStock: 0,
    outOfStock: 0,
    totalPrescriptions: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { hasAnyRole, user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchQuery,
        category: categoryFilter,
        stockStatus: stockFilter
      };

      let result;
      if (activeTab === 'medications') {
        result = await pharmacyService.getAllMedications(params);
      } else {
        result = await pharmacyService.getAllPrescriptions(params);
      }
      
      if (result.success) {
        setItems(result.data.medications || result.data.prescriptions || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotalItems(result.data.pagination?.totalItems || 0);
        setCurrentPage(result.data.pagination?.currentPage || 1);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      const result = await dashboardService.getPharmacyStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory stats:', error);
    }
  };

  useEffect(() => {
    fetchData(1);
    if (activeTab === 'medications') {
      fetchInventoryStats();
    }
  }, [activeTab, searchQuery, categoryFilter, stockFilter]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setCategoryFilter('');
    setStockFilter('');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStockFilter = (e) => {
    setStockFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
  };

  const getStockStatus = (quantity, minQuantity = 10) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= minQuantity) return 'low-stock';
    return 'in-stock';
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleRestockMedication = async (medicationId) => {
    try {
      const result = await pharmacyService.updateInventory(medicationId, {
        quantity: 100, // Default restock quantity
        action: 'restock'
      });

      if (result.success) {
        toast.success('Medication restocked successfully');
        fetchData(currentPage);
        fetchInventoryStats();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to restock medication');
    }
  };

  const handleFulfillPrescription = async (prescriptionId) => {
    try {
      const result = await pharmacyService.fulfillPrescription(prescriptionId, {
        fulfilledBy: user._id,
        fulfilledAt: new Date()
      });

      if (result.success) {
        toast.success('Prescription fulfilled successfully');
        fetchData(currentPage);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to fulfill prescription');
    }
  };

  if (loading && items.length === 0) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading {activeTab}...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <Pill size={32} />
          Pharmacy Management
        </PageTitle>
        
        {hasAnyRole(['admin', 'doctor']) && (
          <AddButton
            onClick={() => navigate(`/${activeTab}/new`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Add {activeTab === 'medications' ? 'Medication' : 'Prescription'}
          </AddButton>
        )}
      </PageHeader>

      <TabContainer>
        <Tab
          active={activeTab === 'medications'}
          onClick={() => handleTabChange('medications')}
        >
          <Package size={18} style={{ marginRight: '8px' }} />
          Medications ({stats.totalMedications})
        </Tab>
        <Tab
          active={activeTab === 'prescriptions'}
          onClick={() => handleTabChange('prescriptions')}
        >
          <FileText size={18} style={{ marginRight: '8px' }} />
          Prescriptions ({stats.totalPrescriptions})
        </Tab>
      </TabContainer>

      {activeTab === 'medications' && (
        <StatsContainer>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <StatHeader>
              <StatIcon color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <Package size={22} color="white" />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.totalMedications}</StatValue>
            <StatLabel>Total Medications</StatLabel>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatHeader>
              <StatIcon color="linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)">
                <TrendingDown size={22} color="white" />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.lowStock}</StatValue>
            <StatLabel>Low Stock Items</StatLabel>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatHeader>
              <StatIcon color="linear-gradient(135deg, #e53e3e 0%, #fc8181 100%)">
                <AlertTriangle size={22} color="white" />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.outOfStock}</StatValue>
            <StatLabel>Out of Stock</StatLabel>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatHeader>
              <StatIcon color="linear-gradient(135deg, #48bb78 0%, #68d391 100%)">
                <CheckCircle size={22} color="white" />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.totalPrescriptions}</StatValue>
            <StatLabel>Prescriptions Today</StatLabel>
          </StatCard>
        </StatsContainer>
      )}

      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={handleSearch}
          />
        </SearchContainer>

        {activeTab === 'medications' && (
          <>
            <FilterSelect value={categoryFilter} onChange={handleCategoryFilter}>
              <option value="">All Categories</option>
              <option value="antibiotics">Antibiotics</option>
              <option value="painkillers">Painkillers</option>
              <option value="vitamins">Vitamins</option>
              <option value="cardiac">Cardiac</option>
              <option value="diabetes">Diabetes</option>
            </FilterSelect>

            <FilterSelect value={stockFilter} onChange={handleStockFilter}>
              <option value="">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </FilterSelect>
          </>
        )}

        {activeTab === 'prescriptions' && (
          <FilterSelect value={stockFilter} onChange={handleStockFilter}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
        )}
      </FiltersContainer>

      {items.length === 0 ? (
        <EmptyState>
          <Pill size={64} color="#cbd5e0" />
          <h3>No {activeTab} found</h3>
          <p>
            {searchQuery || categoryFilter || stockFilter
              ? 'Try adjusting your search criteria'
              : `Get started by adding your first ${activeTab === 'medications' ? 'medication' : 'prescription'}`
            }
          </p>
          {hasAnyRole(['admin', 'doctor']) && (
            <AddButton
              onClick={() => navigate(`/${activeTab}/new`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              Add First {activeTab === 'medications' ? 'Medication' : 'Prescription'}
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <>
          <ItemsGrid>
            {items.map((item) => {
              const stockStatus = activeTab === 'medications' 
                ? getStockStatus(item.quantity, item.minQuantity)
                : item.status;

              return (
                <ItemCard
                  key={item._id}
                  stockStatus={stockStatus}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ItemHeader>
                    <ItemInfo>
                      <ItemName>
                        {item.name || item.medication?.name}
                      </ItemName>
                      <ItemBrand>
                        {item.manufacturer || item.medication?.manufacturer}
                      </ItemBrand>
                      <ItemCode>
                        {activeTab === 'medications' 
                          ? `SKU: ${item.sku}` 
                          : `RX: ${item.prescriptionNumber}`
                        }
                      </ItemCode>
                    </ItemInfo>
                    <StockBadge status={stockStatus}>
                      {getStockStatusIcon(stockStatus)}
                      {stockStatus}
                    </StockBadge>
                  </ItemHeader>

                  {activeTab === 'medications' ? (
                    <>
                      <DetailGrid>
                        <DetailItem>
                          <DetailValue>{item.quantity || 0}</DetailValue>
                          <DetailLabel>In Stock</DetailLabel>
                        </DetailItem>
                        <DetailItem>
                          <DetailValue>${item.unitPrice || 0}</DetailValue>
                          <DetailLabel>Unit Price</DetailLabel>
                        </DetailItem>
                      </DetailGrid>

                      <ItemDescription>
                        <strong>Category:</strong> {item.category} <br />
                        <strong>Expires:</strong> {formatDate(item.expiryDate)}
                      </ItemDescription>
                    </>
                  ) : (
                    <>
                      <ItemDetails>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Patient:</strong> {item.patient?.firstName} {item.patient?.lastName}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Doctor:</strong> Dr. {item.doctor?.firstName} {item.doctor?.lastName}
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Dosage:</strong> {item.dosage}
                        </div>
                        <div>
                          <strong>Instructions:</strong> {item.instructions}
                        </div>
                      </ItemDetails>
                    </>
                  )}

                  <ItemActions>
                    <ActionButton
                      onClick={() => navigate(`/${activeTab}/${item._id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Eye size={16} />
                      View
                    </ActionButton>
                    
                    {hasAnyRole(['admin', 'doctor']) && (
                      <ActionButton
                        onClick={() => navigate(`/${activeTab}/${item._id}/edit`)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit size={16} />
                        Edit
                      </ActionButton>
                    )}
                    
                    {activeTab === 'medications' && stockStatus === 'low-stock' && (
                      <ActionButton
                        className="warning"
                        onClick={() => handleRestockMedication(item._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Package size={16} />
                        Restock
                      </ActionButton>
                    )}

                    {activeTab === 'prescriptions' && item.status === 'pending' && (
                      <ActionButton
                        className="success"
                        onClick={() => handleFulfillPrescription(item._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckCircle size={16} />
                        Fulfill
                      </ActionButton>
                    )}
                  </ItemActions>
                </ItemCard>
              );
            })}
          </ItemsGrid>

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
      
      <AskAISection>
        <AskAIChatbot />
      </AskAISection>
    </PageContainer>
  );
};

export default Pharmacy;