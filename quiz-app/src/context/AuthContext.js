import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedEmail) setEmail(storedEmail);
        if (storedToken) setUserToken(storedToken);
      } catch (error) {
        console.log("AUTH STATE LOAD ERROR", error?.message || error);
      }
    };

    loadAuthState();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("email", email || "").catch((error) => {
      console.log("EMAIL SAVE ERROR", error?.message || error);
    });
  }, [email]);

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
