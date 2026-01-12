/**
 * Utility functions to decode JWT token and extract user information
 */

/**
 * Decode JWT token and return the payload
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

/**
 * Extract userId from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User ID or null if not found
 */
export const getUserIdFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  // Helper to check if a value is an email
  const isEmail = (value) => {
    if (!value || typeof value !== 'string') return false;
    return value.includes('@') && value.includes('.');
  };
  
  // Try to get userId from various possible fields, but exclude email values
  const possibleValues = [
    decoded.userId,
    decoded.id,
    decoded.userId?.toString(),
    decoded.user?.id,
    decoded.user?._id,
    decoded._id,
    // Only use sub if it's NOT an email
    decoded.sub && !isEmail(decoded.sub) ? decoded.sub : null
  ];
  
  // Find the first valid value that is NOT an email
  for (const value of possibleValues) {
    if (value && !isEmail(value)) {
      return String(value);
    }
  }
  
  return null;
};

/**
 * Extract user email from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User email or null if not found
 */
export const getUserEmailFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return (
    decoded.email ||
    decoded.userEmail ||
    decoded.user?.email ||
    decoded.sub ||
    null
  );
};

