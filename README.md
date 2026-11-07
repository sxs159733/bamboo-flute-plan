# 竹韵 · 竹笛学习计划

为《保姆式竹笛零基础到专业大成系统课程》整理的 14 周学习计划，含 80 课简介、每日打卡、练习笔记与文档导出。纯静态站点，无构建步骤。

在线站点（GitHub Pages）：https://sxs159733.github.io/bamboo-flute-plan/

仓库为公开仓库，任何有写权限的协作者都可以直接 clone、修改、推送；推送 `main` 后由 GitHub Actions 自动发布。

## 目录结构

```
index.html              页面结构（14 周课程 / 80 课 / 打卡 / 笔记 / 导出）
data.js                 课程数据（每周曲目、练习要点、验收标准）
app.js                  渲染、打卡、笔记与导出逻辑
styles.css              全站样式与设计变量
```

## 本地预览

```bash
python -m http.server 8770
```

然后访问 http://127.0.0.1:8770 。

## 改内容

课程安排集中在 `data.js`，打卡与笔记保存在浏览器 `localStorage`，不随仓库同步。

## 协作流程

1. 仓库持有者在 GitHub 的 **Settings → Collaborators** 里邀请成员（对方用自己的 GitHub 账号接受即可，不需要 Qoder 账号）。
2. 从 `main` 拉最新代码，改动按周或按课程模块分开提交，减少冲突。
3. 提 PR 或直接推 `main` 都可以，推上去会自动重新部署。

### 用 AI Agent 协作

仓库是纯静态 HTML/CSS/JS，没有构建步骤和私有依赖，Codex、WorkBuddy、Qoder、Copilot 等 Agent 直接 clone 就能改。

## 部署

仓库根目录就是可直接部署的静态站点，由 `.github/workflows/pages.yml` 在每次推送 `main` 后自动发布到 GitHub Pages，约 1–2 分钟上线。
