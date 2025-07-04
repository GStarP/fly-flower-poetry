/**
 * 游戏逻辑模块导出文件
 */

// 导出类型定义
export type {
  GameStatus,
  PlayerType,
  GameState,
  GameTurnResult,
  GameResult,
  GameDifficulty,
  GameSettings,
} from "./types";

// 导出游戏模块
export {
  type GameModuleInterface,
  GameModule,
  createGameModule,
} from "./core/GameModule";

// 导出常量
export { GAME_CONSTANTS } from "./core/consts";

// 导出Hook
export { useGame } from "./hooks/useGame";
