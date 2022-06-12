import React from "react";
import { Navigate } from "react-router-dom";
import { useLocalStorageState } from "ahooks";

import { loginResponse } from "@/utils/apis/user";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useLocalStorageState<loginResponse>("user");

  return user?.token !== undefined ? (
    <div>
      { children }
    </div>
  ) : (
    <Navigate to="/admin/login" replace />
  )
}

export default RequireAuth;
