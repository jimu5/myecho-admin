# myecho-admin

`myecho-admin` 是 `myecho` 博客系统的后台管理前端。项目使用 React、TypeScript、Ant Design、Ant Design Pro Components、Redux Toolkit、React Router 和 Vditor，构建产物由父仓库后端挂载到 `/admin`。

## 目录结构

- `src/index.tsx`：应用入口，注册 Router、Redux 和 AntD 配置。
- `src/App.tsx`：顶层路由渲染。
- `src/routers`：后台路由守卫和导航链接。
- `src/components`：后台布局、侧边栏、头部、分类等通用组件。
- `src/pages`：文章、评论、链接、文件、主题、设置、登录等页面。
- `src/utils/apis`：后端 API 封装。
- `src/utils/myaxios.ts`：Axios 实例、鉴权 header 和响应解包。
- `src/styles`：后台全局样式。
- `vite.config.ts`：构建配置、`@` 路径别名和本地开发代理。

## 常用命令

请在 `fe/myecho-admin` 目录内执行前端命令。

```sh
npm install
npm start
npm test -- --watchAll=false
npm run build
```

父仓库也提供了快捷入口：

```sh
make admin-test
make admin-build
```

## 本地开发

默认开发代理在 `vite.config.ts` 中配置：

- `/api/` 转发到 `http://localhost:2999`
- `/mos/` 转发到 `http://localhost:2999`

先在父仓库启动后端，再运行 `npm start`。后台页面的生产访问路径是 `/admin`，由 `vite.config.ts` 的 `base` 和父仓库 `make admin-build` 共同约定。

## API 约定

后端 JSON API 使用统一响应包：

```json
{ "code": 0, "msg": "ok", "data": {}, "meta": {} }
```

`src/utils/myaxios.ts` 会统一处理鉴权、错误提示和响应解包。新增 API 时优先放在 `src/utils/apis`，页面组件只调用封装后的方法。

## 测试说明

测试使用 React Testing Library 和 Jest。新增或修改页面行为时，请补充贴近用户行为的测试，优先等待可见 UI 或 API 调用完成，不要通过全局静默 `console.error` 隐藏真实问题。

## 构建输出

`npm run build` 会生成 `build/`。父仓库的 `make admin-build` 会把该目录复制到 `static/admin`，后端只在 `static/admin/index.html` 存在时服务 `/admin/*`。
