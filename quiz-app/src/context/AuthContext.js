import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedEmail) setEmail(storedEmail);
        if (storedToken) setUserToken(storedToken);
      } catch (error) {
        console.log("AUTH STATE LOAD ERROR", error?.message || error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadAuthState();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("email", email || "").catch((error) => {
      console.log("EMAIL SAVE ERROR", error?.message || error);
    });
  }, [email]);

  const signIn = async (token, nextEmail = email) => {
    await AsyncStorage.setItem("token", token);
    if (nextEmail) await AsyncStorage.setItem("email", nextEmail);
    setUserToken(token);
    if (nextEmail) setEmail(nextEmail);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(["token", "email"]);
    setUserToken(null);
    setEmail("");
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        setUserToken,
        email,
        setEmail,
        authLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
