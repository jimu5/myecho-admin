import { useSafeState, useLocalStorageState } from 'ahooks';
import React from 'react';
import { connect } from 'react-redux';
import { UserApi } from '@/utils/apis/user';
import { redirectToAdmin } from '@/utils/navigation';

import s from './index.module.scss';

const LoginBox: React.FC = () => {
  const [nameOrEmail, setNameOrEmail] = useSafeState('');
  const [password, setPassword] = useSafeState('');
  const [loading, setLoading] = useSafeState(false);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [, setUser] = useLocalStorageState('user');

  const handleLogin = (event?: React.FormEvent) => {
    event?.preventDefault();
    let email = '',
      name = '';
    if (nameOrEmail.indexOf('@') > -1) {
      email = nameOrEmail;
    } else {
      name = nameOrEmail;
    }
    setErrorMsg('');
    setLoading(true);
    UserApi.login({ email, name, password }).then((res) => {
      setUser(res);
      redirectToAdmin();
    }).catch((error) => {
      setErrorMsg(error?.msg || error?.message || '登录失败，请检查账号或密码');
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <form className={s.loginBox} onSubmit={handleLogin}>
      <div className={s.loginWrapper}>
        <h2>登录</h2>
        <input
          type="text"
          placeholder="用户名或邮箱"
          autoComplete="username"
          required
          value={nameOrEmail}
          onChange={(e) => setNameOrEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="密码"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMsg && <p className={s.loginError} role="alert">{errorMsg}</p>}
      </div>
      <button className={s.loginBtn} type="submit" disabled={loading}>
        {loading ? '登录中' : '登录'}
      </button>
    </form>
  );
};

export default connect()(LoginBox);
