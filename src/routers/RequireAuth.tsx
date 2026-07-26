import React from "react";
import { Navigate } from "react-router-dom";
import { useLocalStorageState } from "ahooks";

import { loginResponse, UserApi } from "@/utils/apis/user";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useLocalStorageState<loginResponse>("user");
  const [destination, setDestination] = React.useState<string>();
  const [statusError, setStatusError] = React.useState(false);

  React.useEffect(() => {
    if (user?.token) {
      return;
    }
    UserApi.setupStatus()
      .then(({ needs_setup }) => setDestination(needs_setup ? '/admin/setup' : '/admin/login'))
      .catch(() => setStatusError(true));
  }, [user?.token]);

  if (!user?.token && statusError) {
    return (
      <div className="admin-loading" role="alert">
        无法检查站点状态。
        <button type="button" onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  if (!user?.token && !destination) {
    return <div className="admin-loading">正在检查站点状态...</div>;
  }

  return user?.token ? (
    <div>
      { children }
    </div>
  ) : (
    <Navigate to={destination!} replace />
  )
}

export default RequireAuth;
