import React from 'react';
import { useLocalStorageState, useSafeState } from 'ahooks';

import { loginResponse, setupParams, UserApi } from '@/utils/apis/user';
import { redirectToAdmin, redirectToLogin } from '@/utils/navigation';
import s from '@/pages/Login/Box/index.module.scss';

const Setup: React.FC = () => {
  const [form, setForm] = useSafeState<setupParams>({
    name: '',
    email: '',
    password: '',
    site_title: 'Myecho',
    site_description: '',
  });
  const [passwordConfirm, setPasswordConfirm] = useSafeState('');
  const [checking, setChecking] = useSafeState(true);
  const [statusError, setStatusError] = useSafeState('');
  const [loading, setLoading] = useSafeState(false);
  const [errorMsg, setErrorMsg] = useSafeState('');
  const [, setUser] = useLocalStorageState<loginResponse | undefined>('user');

  React.useEffect(() => {
    UserApi.setupStatus()
      .then(({ needs_setup }) => {
        if (!needs_setup) {
          redirectToLogin();
        }
      })
      .catch((error) => setStatusError(error?.msg || error?.message || '无法检查站点状态，请重试'))
      .finally(() => setChecking(false));
  }, [setChecking, setStatusError]);

  const update = (key: keyof setupParams, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== passwordConfirm) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    UserApi.setup(form)
      .then((result) => {
        if (result.user?.token) {
          setUser(result.user);
          redirectToAdmin();
          return;
        }
        redirectToLogin();
      })
      .catch((error) => setErrorMsg(error?.msg || error?.message || '初始化失败，请重试'))
      .finally(() => setLoading(false));
  };

  if (checking) {
    return <div className="login-page"><div className="admin-loading">正在检查站点状态...</div></div>;
  }

  if (statusError) {
    return (
      <div className="login-page">
        <div className={`${s.loginBox} ${s.setupBox}`}>
          <div className={s.loginWrapper}>
            <h2>无法检查站点状态</h2>
            <p className={s.loginError} role="alert">{statusError}</p>
            <button className={s.loginBtn} type="button" onClick={() => window.location.reload()}>重试</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className={`${s.loginBox} ${s.setupBox}`} onSubmit={submit}>
        <div className={s.loginWrapper}>
          <div className={s.loginBrand}>
            <span className={s.loginBrandMark} aria-hidden="true" />
            <span><strong>Myecho</strong><small>Initial Setup</small></span>
          </div>
          <h2>初始化博客</h2>
          <p className={s.loginLead}>创建管理员并填写最基本的站点信息，之后仍可在后台修改。</p>
          <div className={s.setupGrid}>
            <label>管理员用户名
              <input required autoComplete="username" value={form.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label>管理员邮箱
              <input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </label>
            <label>密码
              <input required minLength={8} type="password" autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} />
            </label>
            <label>确认密码
              <input required minLength={8} type="password" autoComplete="new-password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            </label>
          </div>
          <label>站点名称
            <input required value={form.site_title} onChange={(e) => update('site_title', e.target.value)} />
          </label>
          <label>站点描述
            <textarea rows={3} value={form.site_description} onChange={(e) => update('site_description', e.target.value)} />
          </label>
          {errorMsg && <p className={s.loginError} role="alert">{errorMsg}</p>}
          <button className={s.loginBtn} type="submit" disabled={loading} aria-busy={loading}>
            {loading ? '正在初始化...' : '开始使用'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Setup;
