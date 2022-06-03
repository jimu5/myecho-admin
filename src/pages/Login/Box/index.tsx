import { useSafeState, useLocalStorageState } from 'ahooks';
import React from 'react';
import { connect } from 'react-redux';
import { UserApi } from '@/utils/apis/user';

import s from './index.module.scss';

const LoginBox: React.FC = () => {
  const [nameOrEmail, setNameOrEmail] = useSafeState('');
  const [password, setPassword] = useSafeState('');
  const [, setUser] = useLocalStorageState('user');

  const handleLogin = () => {
    let email = '',
      name = '';
    if (nameOrEmail.indexOf('@') > -1) {
      email = nameOrEmail;
    } else {
      name = nameOrEmail;
    }
    UserApi.login({ email, name, password }).then((res) => {
      setUser(res);
      window.location.href = '/admin';
    });
  };

  return (
    <div className={s.loginBox}>
      <div className={s.loginWrapper}>
        <h2>登录</h2>
        <input
          type="text"
          placeholder="用户名或邮箱"
          value={nameOrEmail}
          onChange={(e) => setNameOrEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className={s.loginBtn} onClick={handleLogin}>
        登录
      </div>
    </div>
  );
};

export default connect()(LoginBox);
