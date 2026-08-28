# Mahayana Capital 静态网站

这是可直接使用 Visual Studio Code 管理的纯静态网站，不依赖 Bootstrap Studio，也不需要构建或数据库。

## 本地预览

1. 使用 VS Code 打开本目录。
2. 打开终端并运行 `npm run dev`。
3. 浏览器访问 `http://127.0.0.1:8080`。

也可以安装 VS Code 推荐的 Live Server 扩展，然后右键 `index.html` 选择 **Open with Live Server**。

## 页面

- `index.html`：默认英文首页
- `zh-cn.html`：简体中文首页
- `zh-tw.html`：繁体中文首页
- `team-en.html` / `team.html` / `team-zh-tw.html`：团队页
- `insights-en.html` / `insights.html` / `insights-zh-tw.html`：洞见页
- `markets-en.html` / `markets.html` / `markets-zh-tw.html`：市场页

## 资源

- `assets/css/mahayanacap.css`：全站样式
- `assets/js/main.js`：菜单、筛选和滚动效果
- `assets/img/`：Logo 与 favicon

市场页中的 RSS.app 组件依赖互联网连接；本地预览或上线后会从 `widget.rss.app` 加载。

## 发布

发布时上传本目录中的 HTML 文件和 `assets` 目录即可。服务器默认首页应设为 `index.html`。
