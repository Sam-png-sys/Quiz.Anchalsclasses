import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = base64.replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs = 0, r1, r2, i = 0; (r2 = str.charAt(i++)); ~r2 && ((bs = bc % 4 ? bs * 64 + r2 : r2), bc++ % 4) ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6 }))) : 0) {
      r2 = chars.indexOf(r2);
    }
    try {
      return JSON.parse(decodeURIComponent(
        output
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      ));
    } catch {
      return JSON.parse(output);
    }
  } catch (error) {
    console.log("JWT decode error:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [currentCourse, setCurrentCourse] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedToken = await AsyncStorage.getItem("token");
        const storedName = await AsyncStorage.getItem("name");
        const storedCourse = await AsyncStorage.getItem("currentCourse");
        const storedCollege = await AsyncStorage.getItem("collegeName");

        if (storedEmail) setEmail(storedEmail);
        if (storedToken) setUserToken(storedToken);
        if (storedName) setName(storedName);
        if (storedCourse) setCurrentCourse(storedCourse);
        if (storedCollege) setCollegeName(storedCollege);
      } catch (error) {
        console.log("AUTH STATE LOAD ERROR", error?.message || error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const signIn = async (token, nextEmail = email) => {
    try {
      await AsyncStorage.setItem("token", token);
      setUserToken(token);
      
      if (nextEmail) {
        await AsyncStorage.setItem("email", nextEmail);
        setEmail(nextEmail);
      }

      const decoded = decodeToken(token);
      if (decoded) {
        const decodedName = decoded.name || "";
        const decodedCourse = decoded.currentCourse || "";
        const decodedCollege = decoded.collegeName || "";

        await AsyncStorage.setItem("name", decodedName);
        await AsyncStorage.setItem("currentCourse", decodedCourse);
        await AsyncStorage.setItem("collegeName", decodedCollege);

        setName(decodedName);
        setCurrentCourse(decodedCourse);
        setCollegeName(decodedCollege);
      }
    } catch (err) {
      console.log("SIGN IN SAVE ERROR", err);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "email", "name", "currentCourse", "collegeName"]);
      setUserToken(null);
      setEmail("");
      setName("");
      setCurrentCourse("");
      setCollegeName("");
    } catch (err) {
      console.log("SIGN OUT ERROR", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        setUserToken,
        email,
        setEmail,
        name,
        setName,
        currentCourse,
        setCurrentCourse,
        collegeName,
        setCollegeName,
        authLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
