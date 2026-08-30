/**
 * Authentication Guard - Protects admin pages
 * Verifies JWT token and manages session timeout
 */

const AUTH_CONFIG = {
    TOKEN_KEY: "adminToken",
    LOGIN_FLAG_KEY: "isAdminLoggedIn",
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
    API_BASE: "https://hostel-qhe0.onrender.com"
};

// Check if user is authenticated
function isUserAuthenticated() {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    const isLoggedIn = localStorage.getItem(AUTH_CONFIG.LOGIN_FLAG_KEY);
    
    return token && isLoggedIn === "true";
}

// Get stored JWT token
function getAuthToken() {
    return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Clear authentication data
function clearAuthentication() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.LOGIN_FLAG_KEY);
    sessionStorage.removeItem("lastActivityTime");
}

// Verify token with backend
async function verifyTokenWithBackend() {
    const token = getAuthToken();
    
    if (!token) return false;
    
    try {
        const response = await fetch(`${AUTH_CONFIG.API_BASE}/api/admin/verify`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            clearAuthentication();
            return false;
        }
        
        return response.ok;
    } catch (error) {
        console.error("Token verification error:", error);
        return false;
    }
}

// Guard for admin pages - must be called at the top of each admin page
async function protectAdminPage() {
    // Check if token exists
    if (!isUserAuthenticated()) {
        console.warn("No authentication found. Redirecting to login...");
        window.location.href = "admin.html";
        return false;
    }
    
    // Verify token with backend
    const isValid = await verifyTokenWithBackend();
    if (!isValid) {
        console.warn("Token verification failed. Redirecting to login...");
        clearAuthentication();
        window.location.href = "admin.html";
        return false;
    }
    
    // Start session timeout monitoring
    initSessionTimeout();
    
    return true;
}

// Initialize session timeout - logs user out after inactivity
function initSessionTimeout() {
    let timeoutId;
    
    const resetTimeout = () => {
        clearTimeout(timeoutId);
        sessionStorage.setItem("lastActivityTime", Date.now());
        
        timeoutId = setTimeout(() => {
            handleSessionTimeout();
        }, AUTH_CONFIG.SESSION_TIMEOUT);
    };
    
    // Track user activity
    document.addEventListener("mousedown", resetTimeout);
    document.addEventListener("keydown", resetTimeout);
    document.addEventListener("scroll", resetTimeout);
    document.addEventListener("touchstart", resetTimeout);
    
    // Initialize timeout on page load
    resetTimeout();
}

// Handle session timeout
function handleSessionTimeout() {
    alert("Your session has expired. Please login again.");
    clearAuthentication();
    window.location.href = "admin.html";
}

// Add authorization header to fetch requests
function createAuthHeader() {
    const token = getAuthToken();
    if (!token) return null;
    
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

// Make authenticated API call
async function makeAuthenticatedRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error("No authentication token found");
    }
    
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers
    };
    
    const response = await fetch(`${AUTH_CONFIG.API_BASE}${endpoint}`, {
        ...options,
        headers
    });
    
    // If unauthorized, clear auth and redirect to login
    if (response.status === 401 || response.status === 403) {
        clearAuthentication();
        window.location.href = "admin.html";
        throw new Error("Unauthorized access");
    }
    
    return response;
}

// Export for use in other scripts
window.AuthGuard = {
    protect: protectAdminPage,
    getToken: getAuthToken,
    createHeader: createAuthHeader,
    makeRequest: makeAuthenticatedRequest,
    clearAuth: clearAuthentication,
    isAuthenticated: isUserAuthenticated
};
