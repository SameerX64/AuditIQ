import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Longer timeout for file uploads and AI processing
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const complianceService = {
  // Upload and analyze compliance document
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append("document", file);

    const response = await api.post("/compliance/upload-document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Generate compliance script
  generateScript: async (scriptData) => {
    const response = await api.post("/compliance/generate-script", scriptData);
    return response.data;
  },

  // Validate compliance script
  validateScript: async (script, osType) => {
    const response = await api.post("/compliance/validate-script", {
      script,
      os_type: osType,
    });
    return response.data;
  },

  // Get user's compliance documents
  getDocuments: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/compliance/documents?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get user's compliance scripts
  getScripts: async (page = 1, limit = 10) => {
    const response = await api.get(
      `/compliance/scripts?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Get specific script
  getScript: async (scriptId) => {
    const response = await api.get(`/compliance/scripts/${scriptId}`);
    return response.data;
  },

  // Delete script
  deleteScript: async (scriptId) => {
    const response = await api.delete(`/compliance/scripts/${scriptId}`);
    return response.data;
  },

  // Get dashboard analytics
  getDashboardData: async () => {
    const response = await api.get("/dashboard/analytics");
    return response.data;
  },

  // Get user activity
  getUserActivity: async () => {
    const response = await api.get("/dashboard/activity");
    return response.data;
  },
};

export default complianceService;
