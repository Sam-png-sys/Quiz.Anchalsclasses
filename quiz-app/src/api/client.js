import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://dranchalclasses.in/api";

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
    console.log("RESPONSE ", response.status, response.config.url);
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
