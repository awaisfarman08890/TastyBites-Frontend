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
  
  return (
    decoded.userId ||
    decoded.id ||
    decoded.userId?.toString() ||
    decoded.user?.id ||
    decoded.user?._id ||
    decoded.sub ||
    null
  );
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

