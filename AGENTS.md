# AGENTS.md

## 项目定位

`myecho-admin` 是 `myecho` 的后台管理前端子模块。它是独立 Git 仓库，父仓库只通过 `fe/myecho-admin` 引用它，并在构建时把 `build/` 复制到父仓库的 `static/admin`。

## 开发规则

- 只使用 npm；保留并更新 `package-lock.json`，不要新增 `yarn.lock`、`pnpm-lock.yaml` 或其他锁文件。
- 按现有 React、TypeScript、Ant Design、Redux Toolkit、React Router 结构做小步修改。
- 页面组件放在 `src/pages`，通用布局和复用组件放在 `src/components`，API 封装放在 `src/utils/apis`。
- 通过 `src/utils/myaxios.ts` 访问后端，保持统一鉴权、错误提示和响应解包逻辑。
- 后端 API 成功响应为 `{code,msg,data,meta}` 且 `code=0`；分页数据使用 `data` 和 `meta`。
- 不要在前端子模块里修改后端接口、数据库或父仓库 Makefile。
- 修改测试时优先修正异步等待和 mock 行为，不要全局吞掉 `console.error` 或 React warning。
- 改动构建、路由、代理或 `/admin` 发布路径时，要同时验证本子模块构建和父仓库 `make admin-build`。

## 常用命令

在 `fe/myecho-admin` 目录执行：

```sh
npm install
npm start
npm test -- --watchAll=false
npm run build
```

从父仓库根目录执行：

```sh
make admin-test
make admin-build
```

## 验证要求

- 普通前端行为改动至少运行 `npm test -- --watchAll=false`。
- 构建、依赖、路由、样式或静态资源相关改动还要运行 `npm run build`。
- 提交前确认没有新增非 npm 锁文件，测试日志中没有新的 React `act(...)` warning 或依赖弃用噪音。
