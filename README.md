# PromptFlow

跨平台提词器 — PWA 核心 + Electron（Windows）+ 移动端 PWA。

> 🚧 **早期阶段：** 设计规范已完成，代码待实现。详见 [ROADMAP.md](./ROADMAP.md)。

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

## 状态

🟡 **设计中。** 下次会话开始实现。

完整架构见 [设计规范](./docs/superpowers/specs/2026-06-25-promptflow-design.md)。
