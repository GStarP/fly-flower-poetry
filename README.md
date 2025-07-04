# fly-flower-poetry

飞花令小游戏

本项目由 Trae Agent 支持开发，感谢 `mcp-feedback-enhanced` 在开发过程中的卓越贡献。

## 快速开始

1. 准备数据：将原始数据下载到 `data/raw`
2. 构造数据库：`cd data/raw && python json_to_sqlite.py` 得到 `poetry.db`
3. 拷贝数据库：将 `poetry.db` 拷贝至 `public/data`
4. 启动项目：`pnpm dev`
