export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

import { useNavigate  } from "react-router-dom";  
export function logout() {
  localStorage.removeItem("token");
  const navigate = useNavigate();
  navigate("/login");
}