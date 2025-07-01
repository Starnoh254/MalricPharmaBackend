# Token Refresh Implementation Guide

## 🔄 How Token Refresh Works

The token refresh system provides seamless user experience by automatically renewing expired tokens without requiring re-login.

### **Token Types:**

1. **Access Token** - Short-lived (1 hour), used for API calls
2. **Refresh Token** - Long-lived (30 days), used to get new access tokens

## 🛠️ Backend Implementation (Complete)

### **New API Endpoints:**

```javascript
// Login (returns both tokens)
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6g7h8i9j0...",
    "user": { "id": 1, "name": "John", "email": "user@example.com" }
  }
}

// Refresh token
POST /api/v1/auth/refresh
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0..."
}

// Logout (revokes refresh token)
POST /api/v1/auth/logout
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0..."
}
```

## 📱 Frontend Implementation

### **1. Update Storage Strategy**

```javascript
// Store both tokens after login
const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  const { accessToken, refreshToken, user } = response.data.data;

  // Store tokens
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));
};
```

### **2. Update API Interceptor**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Request interceptor - add access token
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response, // Success - return response
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Attempt to refresh access token
        const refreshResponse = await axios.post(
          "http://localhost:5000/api/v1/auth/refresh",
          { refreshToken }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data.data;

        // Store new tokens
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        console.error("Token refresh failed:", refreshError);

        // Clear all auth data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Redirect to login for protected pages
        const protectedPaths = ["/cart", "/checkout", "/profile", "/orders"];
        const currentPath = window.location.pathname;

        if (protectedPaths.includes(currentPath)) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### **3. Update Login Component**

```jsx
// LoginComponent.jsx
import { useState } from "react";
import api from "../services/api";

const LoginComponent = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", credentials);
      const { accessToken, refreshToken, user } = response.data.data;

      // Store authentication data
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login error
    }
  };

  return <form onSubmit={handleLogin}>{/* Login form fields */}</form>;
};
```

### **4. Update Logout Function**

```javascript
const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      // Revoke refresh token on backend
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage regardless
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Redirect to login
    window.location.href = "/login";
  }
};
```

## 🔒 Security Features

### **Backend Security:**

- ✅ Refresh tokens stored securely in database
- ✅ Refresh tokens can be revoked
- ✅ Automatic cleanup of expired tokens
- ✅ One-time use refresh tokens (new token on each refresh)

### **Frontend Security:**

- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ Automatic logout on refresh failure
- ✅ Protected route handling

## 🧪 Testing Token Refresh

### **Test Scenarios:**

1. **Normal Login:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Refresh Token:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token-here"}'
```

3. **Test with Expired Token:**

- Wait for access token to expire (1 hour)
- Make API call - should automatically refresh
- Check if new tokens are stored

## 🎯 Benefits of Token Refresh

### **User Experience:**

- ✅ No unexpected logouts
- ✅ Seamless browsing experience
- ✅ Automatic token management
- ✅ Faster app performance

### **Security:**

- ✅ Short-lived access tokens
- ✅ Controlled token lifecycle
- ✅ Ability to revoke access
- ✅ Audit trail of token usage

## 🚀 Your Token Refresh System is Ready!

The implementation includes:

- **Complete backend token refresh functionality**
- **Database schema for refresh tokens**
- **Frontend integration examples**
- **Security best practices**
- **Automatic token cleanup**

Users will now stay logged in seamlessly without interruption! 🎉
