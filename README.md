# PromptFlow

跨平台提词器 — PWA 核心 + Electron（Windows）+ 移动端 PWA。

## 概念

一个无干扰的提词器，处处可用：
- **Windows 桌面：** 无边框浮动窗口，固定屏幕顶部，系统级全局快捷键
- **手机端（iOS/Android）：** PWA 全屏横屏模式 + 触摸手势

基于 [notchprompt](https://github.com/saif0200/notchprompt)（macOS Swift 提词器）的深度分析构建。

## 技术栈

| 层 | 技术 |
|---|------|
| 核心引擎 | TypeScript、Canvas API、Web Components |
| 桌面壳 | Electron、globalShortcut |
| 移动壳 | PWA（manifest.json + service worker） |
| 部署 | Vercel（PWA）+ GitHub Releases（Windows .exe） |

## 项目结构

```
packages/core/        # 共享引擎 + Web Components
  src/state.ts        # StateManager 单例，可观测状态 + localStorage 持久化
  src/engine.ts       # ScrollingEngine，Canvas 60fps 滚动，lerp 加速，双副本循环
  src/components/     # 5 个 Web Components（tp-view/controls/editor/settings/countdown）
packages/desktop/     # Electron 壳，无边框 alwaysOnTop 窗口 + 全局快捷键
apps/mobile/          # PWA 入口，横屏全屏 + 触摸手势 + Service Worker
```

## 快速开始

```bash
# 安装依赖
npm install

# 类型检查
npm run typecheck

# 启动桌面版（需要 Electron）
npm run desktop:start

# 构建 Windows .exe
npm run desktop:dist
```

移动端：直接在浏览器打开 `apps/mobile/index.html`，或部署到 Vercel。

## 状态

🟢 **已实现。** Phase 1-3 完成。待集成测试。

完整架构见 [设计规范](./docs/superpowers/specs/2026-06-25-promptflow-design.md)。实现计划见 [ROADMAP.md](./ROADMAP.md)。
