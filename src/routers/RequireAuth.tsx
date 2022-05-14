import React from "react";
import { Navigate } from "react-router-dom";
import { useLocalStorageState } from "ahooks";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useLocalStorageState("user");

  return user?.token !== undefined ? (
    <div>
      { children }
    </div>
  ) : (
    <Navigate to="/login" replace />
  )
}

export default RequireAuth;
