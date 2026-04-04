import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "http://192.168.1.6:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

console.log(" API BASE URL:", API.defaults.baseURL);

// Attach token automatically
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;