import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [email, setEmail] = useState("");

  return (
    <AuthContext.Provider
      value={{
        userToken,
        setUserToken,
        email,
        setEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};