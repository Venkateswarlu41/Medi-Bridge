// Get the current user from local storage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const user = getCurrentUser();
  if (!user || !user.roles) {
    return false;
  }
  return roles.some((role) => user.roles.includes(role));
};

// Check if user has all of the specified roles
export const hasAllRoles = (roles) => {
  const user = getCurrentUser();
  if (!user || !user.roles) {
    return false;
  }
  return roles.every((role) => user.roles.includes(role));
};

// Get user's token
export const getToken = () => {
  const user = getCurrentUser();
  return user?.token;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Set user in local storage
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Remove user from local storage
export const removeUser = () => {
  localStorage.removeItem("user");
};
