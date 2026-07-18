import { useSafeState, useLocalStorageState } from 'ahooks';
import React from 'react';
import { connect } from 'react-redux';
import { loginResponse, UserApi } from '@/utils/apis/user';
import { redirectToAdmin } from '@/utils/navigation';

import s from './index.module.scss';

const ADMIN_PERMISSION_TYPE = 0;

const LoginBox: React.FC = () => {
  const [nameOrEmail, setNameOrEmail] = useSafeState('');
  const [password, setPassword] = useSafeState('');
  const [loading, setLoading] = useSafeState(false);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [, setUser] = useLocalStorageState<loginResponse | undefined>('user');

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
      if (!res?.token) {
        setUser(undefined);
        setErrorMsg('登录响应缺少 Token，请重试');
        return;
      }
      if (res.permission_type !== ADMIN_PERMISSION_TYPE) {
        setUser(undefined);
        setErrorMsg('当前账号无后台管理权限');
        return;
      }
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
        <div className={s.loginBrand}>
          <span className={s.loginBrandMark} aria-hidden="true" />
          <span>
            <strong>Myecho</strong>
            <small>Blog Admin</small>
          </span>
        </div>
        <h2>欢迎回来</h2>
        <p className={s.loginLead}>登录内容工作台，继续管理文章、评论与站点资产。</p>
        <label htmlFor="admin-account">账号</label>
        <input
          id="admin-account"
          type="text"
          placeholder="用户名或邮箱"
          autoComplete="username"
          required
          value={nameOrEmail}
          onChange={(e) => setNameOrEmail(e.target.value)}
        />
        <label htmlFor="admin-password">密码</label>
        <input
          id="admin-password"
          type="password"
          placeholder="密码"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMsg && <p className={s.loginError} role="alert">{errorMsg}</p>}
        <button className={s.loginBtn} type="submit" disabled={loading} aria-busy={loading}>
          {loading ? '登录中' : '登录'}
        </button>
        <p className={s.loginHint}>仅管理员账号可访问后台</p>
      </div>
    </form>
  );
};

export default connect()(LoginBox);
