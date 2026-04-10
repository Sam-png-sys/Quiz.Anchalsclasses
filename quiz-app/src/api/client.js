import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️  Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and paste your
//     WiFi IPv4 address below. Must match the machine running uvicorn.
const BASE_URL = "http://192.168.1.8:8000"; // <-- update this if your IP changed

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s timeout so you get a clear error instead of hanging
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API BASE URL:", API.defaults.baseURL);

// Attach token automatically
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("REQUEST →", config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Log every response/error so you can see exactly what's happening
API.interceptors.response.use(
  (response) => {
    console.log("RESPONSE ✅", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log(
      "RESPONSE ❌",
      error.config?.url,
      error.response?.status ?? "NO_RESPONSE",
      error.message
    );
    return Promise.reject(error);
  }
);

export default API;