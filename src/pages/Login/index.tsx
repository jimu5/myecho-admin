import React from 'react';

import { UserApi } from '@/utils/apis/user';
import { redirectToSetup } from '@/utils/navigation';
import LoginBox from './Box';

const Login = () => {
  const [checking, setChecking] = React.useState(true);
  const [statusError, setStatusError] = React.useState(false);

  React.useEffect(() => {
    UserApi.setupStatus().then(({ needs_setup }) => {
      if (needs_setup) {
        redirectToSetup();
      }
    }).catch(() => setStatusError(true)).finally(() => setChecking(false));
  }, []);

  if (checking) {
    return <div className="login-page"><div className="admin-loading">正在检查站点状态...</div></div>;
  }

  if (statusError) {
    return (
      <div className="login-page">
        <div className="admin-loading" role="alert">
          无法检查站点状态。
          <button type="button" onClick={() => window.location.reload()}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <LoginBox />
    </div>
  );
};

export default Login;
