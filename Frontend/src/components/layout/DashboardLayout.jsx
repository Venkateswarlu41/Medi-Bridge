import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Users,
  FileText,
  Activity,
  Settings,
  LogOut,
  Bell,
  Heart,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  BarChart3,
  UserCircle,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 50%, #f8fafb 100%);
`;

const Sidebar = styled(motion.aside)`
  width: ${props => props.isCollapsed ? '80px' : '280px'};
  background: linear-gradient(180deg, #1a1d29 0%, #2d3142 100%);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;

  @media (max-width: 968px) {
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    width: 280px;
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.isCollapsed ? '24px 16px' : '32px 24px'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: ${props => props.isCollapsed ? 'center' : 'space-between'};
  transition: all 0.3s ease;
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
`;

const SidebarLogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(84, 169, 234, 0.4);
  flex-shrink: 0;
`;

const SidebarLogoText = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: var(--font-family-heading);
  white-space: nowrap;
  opacity: ${props => props.isCollapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
`;

const CollapseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

const SidebarNav = styled.nav`
  flex: 1;
  padding: 24px 16px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const NavSection = styled.div`
  margin-bottom: 32px;
`;

const NavSectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: ${props => props.isCollapsed ? '0' : '0 12px 12px'};
  font-family: var(--font-family-heading);
  text-align: ${props => props.isCollapsed ? 'center' : 'left'};
  opacity: ${props => props.isCollapsed ? '0' : '1'};
  transition: opacity 0.3s ease;
`;

const NavItem = styled(motion.button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  gap: 12px;
  padding: ${props => props.isCollapsed ? '14px' : '14px 16px'};
  background: ${props => props.active ? 'linear-gradient(135deg, #54a9ea 0%, #8458fd 100%)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 500;
  font-family: var(--font-family-body);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #54a9ea 0%, #8458fd 100%);
    transform: scaleY(${props => props.active ? '1' : '0'});
    transition: transform 0.3s ease;
  }

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #54a9ea 0%, #8458fd 100%)' : 'rgba(255, 255, 255, 0.1)'};
    color: white;
    transform: translateX(${props => props.isCollapsed ? '0' : '4px'});

    &::before {
      transform: scaleY(1);
    }
  }

  svg {
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    opacity: ${props => props.isCollapsed ? '0' : '1'};
    width: ${props => props.isCollapsed ? '0' : 'auto'};
    transition: opacity 0.3s ease;
  }
`;

const SidebarFooter = styled.div`
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${props => props.isCollapsed ? '12px 0' : '12px'};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #54a9ea 0%, #8458fd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  font-family: var(--font-family-heading);
  flex-shrink: 0;
`;

const UserProfileInfo = styled.div`
  flex: 1;
  opacity: ${props => props.isCollapsed ? '0' : '1'};
  width: ${props => props.isCollapsed ? '0' : 'auto'};
  overflow: hidden;
  transition: opacity 0.3s ease;
`;

const UserProfileName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: white;
  font-family: var(--font-family-heading);
  white-space: nowrap;
`;

const UserProfileRole = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: capitalize;
  white-space: nowrap;
`;

const MainWrapper = styled.div`
  flex: 1;
  margin-left: ${props => props.isCollapsed ? '80px' : '280px'};
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  transition: margin-left 0.3s ease;

  @media (max-width: 968px) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);

  @media (max-width: 968px) {
    padding: 16px 24px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MenuButton = styled.button`
  display: none;
  padding: 10px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    color: #54a9ea;
    border-color: #54a9ea;
  }

  @media (max-width: 968px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 400px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.3s ease;
  font-family: var(--font-family-body);

  &:focus {
    outline: none;
    border-color: #54a9ea;
    background: white;
    box-shadow: 0 0 0 4px rgba(84, 169, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderButton = styled.button`
  padding: 10px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: white;
    color: #54a9ea;
    border-color: #54a9ea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(84, 169, 234, 0.15);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
`;

const Content = styled.main`
  flex: 1;
  padding: 40px;

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const Overlay = styled(motion.div)`
  display: none;

  @media (max-width: 968px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const DashboardLayout = ({ children, pageTitle = 'Dashboard' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/dashboard' },
    { id: 'appointments', icon: Calendar, label: 'Appointments', path: '/appointments' },
    { id: 'patients', icon: Users, label: 'Patients', path: '/patients' },
    { id: 'doctors', icon: Stethoscope, label: 'Doctors', path: '/doctors' },
    { id: 'records', icon: FileText, label: 'Medical Records', path: '/medical-records' },
    { id: 'reports', icon: BarChart3, label: 'Reports', path: '/reports' },
  ];

  const settingsItems = [
    { id: 'profile', icon: UserCircle, label: 'Profile', path: '/profile' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed}>
        <SidebarHeader isCollapsed={sidebarCollapsed}>
          <SidebarLogo>
            <SidebarLogoIcon>
              <Heart size={24} color="white" />
            </SidebarLogoIcon>
            <SidebarLogoText isCollapsed={sidebarCollapsed}>
              Hygeia-Nexus
            </SidebarLogoText>
          </SidebarLogo>
          <CollapseButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </CollapseButton>
        </SidebarHeader>

        <SidebarNav>
          <NavSection>
            <NavSectionTitle isCollapsed={sidebarCollapsed}>Main Menu</NavSectionTitle>
            {navigationItems.map((item) => (
              <NavItem
                key={item.id}
                active={isActive(item.path)}
                isCollapsed={sidebarCollapsed}
                onClick={() => handleNavigation(item.path)}
                whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavItem>
            ))}
          </NavSection>

          <NavSection>
            <NavSectionTitle isCollapsed={sidebarCollapsed}>Settings</NavSectionTitle>
            {settingsItems.map((item) => (
              <NavItem
                key={item.id}
                active={isActive(item.path)}
                isCollapsed={sidebarCollapsed}
                onClick={() => handleNavigation(item.path)}
                whileHover={{ x: sidebarCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavItem>
            ))}
          </NavSection>
        </SidebarNav>

        <SidebarFooter>
          <UserProfile isCollapsed={sidebarCollapsed}>
            <UserAvatar>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </UserAvatar>
            <UserProfileInfo isCollapsed={sidebarCollapsed}>
              <UserProfileName>{user?.firstName} {user?.lastName}</UserProfileName>
              <UserProfileRole>{user?.role?.replace('_', ' ')}</UserProfileRole>
            </UserProfileInfo>
          </UserProfile>
        </SidebarFooter>
      </Sidebar>

      <AnimatePresence>
        {sidebarOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <MainWrapper isCollapsed={sidebarCollapsed}>
        <Header>
          <HeaderLeft>
            <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </MenuButton>
            <SearchBar>
              <SearchIcon>
                <Search size={18} />
              </SearchIcon>
              <SearchInput placeholder="Search patients, appointments..." />
            </SearchBar>
          </HeaderLeft>

          <HeaderRight>
            <HeaderButton>
              <Bell size={20} />
              <NotificationBadge />
            </HeaderButton>
            <HeaderButton>
              <Settings size={20} />
            </HeaderButton>
            <HeaderButton onClick={handleLogout}>
              <LogOut size={20} />
            </HeaderButton>
          </HeaderRight>
        </Header>

        <Content>{children}</Content>
      </MainWrapper>
    </LayoutContainer>
  );
};

export default DashboardLayout;
