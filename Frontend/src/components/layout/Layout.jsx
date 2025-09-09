import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Menu,
  X,
  Home,
  Users,
  Calendar,
  FileText,
  Activity,
  Pill,
  CreditCard,
  Building,
  UserCheck,
  Settings,
  LogOut,
  Bell,
  Search,
  Bot,
  TestTube,
  Stethoscope,
} from "lucide-react";

import SidebarDiseasePredictor from "../dashboard/SidebarDiseasePredictor";

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--gray-50);
`;

const Sidebar = styled(motion.aside)`
  width: 280px;
  background: white;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  border-right: 1px solid var(--gray-200);

  @media (max-width: 768px) {
    width: 100%;
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.div`
  width: 42px;
  height: 42px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 120, 212, 0.2);
`;

const LogoText = styled.h1`
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.5px;
`;

const SidebarNav = styled.nav`
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: 30px;
`;

const NavSectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px 20px;
`;

const NavItem = styled(motion.div)`
  margin: 2px 10px;
`;

const NavLink = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !["active"].includes(prop),
})`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)"
      : "transparent"};
  color: ${(props) => (props.active ? "white" : "var(--gray-600)")};
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: left;
  box-shadow: ${(props) => (props.active ? "var(--shadow-sm)" : "none")};

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)"
        : "var(--gray-100)"};
    color: ${(props) => (props.active ? "white" : "var(--gray-800)")};
    transform: translateX(3px);
  }
`;

const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid var(--gray-200);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const UserAvatar = styled.div`
  width: 42px;
  height: 42px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  border: 2px solid white;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: var(--gray-800);
  font-size: 14px;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: var(--gray-500);
  text-transform: capitalize;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  background: white;
  padding: 18px 30px;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--gray-200);
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--gray-600);
  cursor: pointer;
  padding: 5px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const SearchBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 320px;
  padding: 12px 16px 12px 42px;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  font-size: 14px;
  background: var(--gray-50);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
  }

  &::placeholder {
    color: var(--gray-400);
  }

  @media (max-width: 768px) {
    width: 200px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: var(--gray-400);
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IconButton = styled.button`
  width: 42px;
  height: 42px;
  border: none;
  background: var(--gray-50);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--gray-100);
    color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const PageContent = styled.div`
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background-color: var(--gray-50);
  min-height: calc(100vh - 80px);
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [predictorOpen, setPredictorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Add Disease Predictor below Lab Results for doctors
  const getNavItems = (role) => {
    const commonItems = [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
    ];
    const roleSpecificItems = {
      admin: [
        { icon: Users, label: "Patients", path: "/patients" },
        { icon: UserCheck, label: "Doctors", path: "/doctors" },
        { icon: TestTube, label: "Lab Technicians", path: "/lab-technicians" },
        { icon: Calendar, label: "Appointments", path: "/appointments" },
        { icon: FileText, label: "Medical Records", path: "/medical-records" },
        { icon: Pill, label: "Pharmacy", path: "/pharmacy" },
        { icon: CreditCard, label: "Billing", path: "/billing" },
        { icon: Building, label: "Departments", path: "/departments" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ],
      doctor: [
        { icon: Calendar, label: "My Schedule", path: "/appointments" },
        { icon: Users, label: "My Patients", path: "/patients" },
        { icon: FileText, label: "Medical Records", path: "/medical-records" },
        { icon: Pill, label: "Prescriptions", path: "/prescriptions" },
        { icon: Activity, label: "Lab Results", path: "/lab-results" },
        {
          icon: Stethoscope,
          label: "Disease Predictor",
          path: "/disease-predictor",
        },
      ],
      patient: [
        { icon: Calendar, label: "My Appointments", path: "/appointments" },
        { icon: FileText, label: "Medical History", path: "/medical-records" },
        { icon: Activity, label: "Lab Results", path: "/lab-results" },
        { icon: CreditCard, label: "Billing", path: "/billing" },
        { icon: Pill, label: "Prescriptions", path: "/prescriptions" },
        { icon: Bot, label: "Ask AI", path: "/ask-ai" },
      ],
      lab_technician: [
        { icon: TestTube, label: "Lab Tests", path: "/lab-tests" },
        { icon: FileText, label: "Test Results", path: "/test-results" },
        { icon: Users, label: "Patients", path: "/patients" },
      ],
    };
    // For doctor, insert Disease Predictor after Lab Results
    // No sidebar/modal Disease Predictor, only the /disease-predictor page link
    return [...commonItems, ...(roleSpecificItems[role] || [])];
  };
  const navItems = getNavItems(user?.role);

  const getUserInitials = (user) => {
    if (!user) return "U";
    return `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase();
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <LayoutContainer>
      <AnimatePresence>
        {sidebarOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      <Sidebar
        className={sidebarOpen ? "open" : ""}
        initial={false}
        animate={{ x: sidebarOpen ? 0 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <SidebarHeader>
          <Logo>
            <Heart size={24} color="white" />
          </Logo>
          <LogoText>Hygeia-Nexus</LogoText>
        </SidebarHeader>

        <SidebarNav>
          <NavSection>
            <NavSectionTitle>Main</NavSectionTitle>
            {navItems.map((item, index) => (
              <NavItem key={index}>
                <NavLink
                  active={item.path && location.pathname === item.path}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.path) {
                      navigate(item.path);
                      closeSidebar();
                    }
                  }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              </NavItem>
            ))}
          </NavSection>
        </SidebarNav>

        <SidebarFooter>
          <UserInfo>
            <UserAvatar>{getUserInitials(user)}</UserAvatar>
            <UserDetails>
              <UserName>
                {user?.fullName || `${user?.firstName} ${user?.lastName}`}
              </UserName>
              <UserRole>{user?.role?.replace("_", " ")}</UserRole>
            </UserDetails>
          </UserInfo>

          <NavLink onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </NavLink>
        </SidebarFooter>
      </Sidebar>

      <MainContent style={{ position: "relative" }}>
        <TopBar>
          <TopBarLeft>
            <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </MobileMenuButton>

            <SearchBar>
              <SearchIcon>
                <Search size={18} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search patients, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
          </TopBarLeft>

          <TopBarRight>
            <IconButton>
              <Bell size={18} />
            </IconButton>
            <IconButton onClick={() => navigate("/settings")}>
              <Settings size={18} />
            </IconButton>
          </TopBarRight>
        </TopBar>

        <PageContent>{children}</PageContent>
        {/* Disease Predictor sidebar removed, now full page */}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
