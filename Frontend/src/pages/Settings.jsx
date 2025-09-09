import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
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

const SettingsContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
`;

const SidebarItem = styled.div`
  padding: 12px 15px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4a5568'};

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f7fafc'};
    color: ${props => props.active ? 'white' : '#2d3748'};
  }
`;

const MainContent = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: ${props => props.disabled ? '#f7fafc' : 'white'};

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    color: #a0aec0;
  }
`;

const Select = styled.select`
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #667eea;
  }
`;

const Switch = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const SwitchButton = styled.button`
  width: 50px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: ${props => props.active ? '#667eea' : '#e2e8f0'};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.active ? '24px' : '2px'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SwitchLabel = styled.span`
  font-size: 14px;
  color: #4a5568;
`;

const SaveButton = styled(motion.button)`
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ColorPicker = styled.input`
  width: 60px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
`;

const PresetColors = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ColorSwatch = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${props => props.active ? '#2d3748' : '#e2e8f0'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    systemUpdates: true,
    marketingEmails: false
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    primaryColor: '#667eea',
    language: 'en'
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section) => {
    setLoading(true);
    try {
      // In a real app, you would save these to a backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setLoading(false);
    }
  };

  const presetColors = [
    '#667eea', '#48bb78', '#ed8936', '#e53e3e', 
    '#38b2ac', '#9f7aea', '#d53f8c', '#2d3748'
  ];

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Database },
    { id: 'system', label: 'System', icon: SettingsIcon }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div>
            <SectionTitle>
              <User size={24} />
              Profile Settings
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>First Name</Label>
                <Input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    firstName: e.target.value
                  })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    lastName: e.target.value
                  })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profileData.email}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    phone: e.target.value
                  })}
                />
              </FormGroup>
            </FormGrid>
            <SaveButton
              onClick={handleProfileUpdate}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Profile'}
            </SaveButton>
          </div>
        );

      case 'security':
        return (
          <div>
            <SectionTitle>
              <Shield size={24} />
              Security Settings
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Current Password</Label>
                <PasswordInputContainer>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </PasswordToggle>
                </PasswordInputContainer>
              </FormGroup>
              <FormGroup>
                <Label>New Password</Label>
                <PasswordInputContainer>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </PasswordToggle>
                </PasswordInputContainer>
              </FormGroup>
              <FormGroup>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                />
              </FormGroup>
            </FormGrid>
            <SaveButton
              onClick={handlePasswordChange}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              {loading ? 'Changing...' : 'Change Password'}
            </SaveButton>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <SectionTitle>
              <Bell size={24} />
              Notification Settings
            </SectionTitle>
            {Object.entries(notifications).map(([key, value]) => (
              <Switch key={key}>
                <SwitchButton
                  active={value}
                  onClick={() => setNotifications({
                    ...notifications,
                    [key]: !value
                  })}
                />
                <SwitchLabel>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </SwitchLabel>
              </Switch>
            ))}
            <SaveButton
              onClick={() => saveSettings('notification')}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Notifications'}
            </SaveButton>
          </div>
        );

      case 'appearance':
        return (
          <div>
            <SectionTitle>
              <Palette size={24} />
              Appearance Settings
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Theme</Label>
                <Select
                  value={appearance.theme}
                  onChange={(e) => setAppearance({
                    ...appearance,
                    theme: e.target.value
                  })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Language</Label>
                <Select
                  value={appearance.language}
                  onChange={(e) => setAppearance({
                    ...appearance,
                    language: e.target.value
                  })}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Primary Color</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <ColorPicker
                    type="color"
                    value={appearance.primaryColor}
                    onChange={(e) => setAppearance({
                      ...appearance,
                      primaryColor: e.target.value
                    })}
                  />
                  <PresetColors>
                    {presetColors.map(color => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        active={appearance.primaryColor === color}
                        onClick={() => setAppearance({
                          ...appearance,
                          primaryColor: color
                        })}
                      />
                    ))}
                  </PresetColors>
                </div>
              </FormGroup>
            </FormGrid>
            <SaveButton
              onClick={() => saveSettings('appearance')}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Appearance'}
            </SaveButton>
          </div>
        );

      case 'privacy':
        return (
          <div>
            <SectionTitle>
              <Database size={24} />
              Privacy Settings
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Profile Visibility</Label>
                <Select
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({
                    ...privacy,
                    profileVisibility: e.target.value
                  })}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="restricted">Restricted</option>
                </Select>
              </FormGroup>
            </FormGrid>
            {Object.entries(privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
              <Switch key={key}>
                <SwitchButton
                  active={value}
                  onClick={() => setPrivacy({
                    ...privacy,
                    [key]: !value
                  })}
                />
                <SwitchLabel>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </SwitchLabel>
              </Switch>
            ))}
            <SaveButton
              onClick={() => saveSettings('privacy')}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Privacy'}
            </SaveButton>
          </div>
        );

      case 'system':
        return (
          <div>
            <SectionTitle>
              <SettingsIcon size={24} />
              System Information
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Application Version</Label>
                <Input value="1.0.0" disabled />
              </FormGroup>
              <FormGroup>
                <Label>Last Updated</Label>
                <Input value={new Date().toLocaleDateString()} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Database Status</Label>
                <Input value="Connected" disabled />
              </FormGroup>
              <FormGroup>
                <Label>Server Status</Label>
                <Input value="Online" disabled />
              </FormGroup>
            </FormGrid>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <SettingsIcon size={32} />
          Settings
        </PageTitle>
      </PageHeader>

      <SettingsContainer>
        <Sidebar>
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.id}
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={18} />
              {item.label}
            </SidebarItem>
          ))}
        </Sidebar>

        <MainContent>
          {renderContent()}
        </MainContent>
      </SettingsContainer>
    </PageContainer>
  );
};

export default Settings;