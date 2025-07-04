/**
 * 游戏逻辑模块类型定义
 */

import type { Sentence } from "../data/types";

// 游戏状态枚举
export type GameStatus = "ready" | "playing" | "ended";

// 玩家类型枚举
export type PlayerType = "player" | "robot";

// 游戏状态接口
export interface GameState {
  status: GameStatus;
  limitChar: string;
  currentTurn: PlayerType;
  usedSentences: Sentence[];
  remainingTime?: number; // 玩家剩余时间（秒）
  result?: GameResult;
}

// 游戏回合结果接口
export interface GameTurnResult {
  success: boolean;
  sentence?: Sentence;
  message?: string;
  gameOver?: boolean;
}

// 游戏结果接口
export interface GameResult {
  winner: PlayerType;
  reason: string;
  recommendedSentences?: Sentence[];
}

// 游戏难度枚举
export type GameDifficulty = "easy" | "medium" | "hard";

// 游戏设置接口
export interface GameSettings {
  difficulty: GameDifficulty;
  timeLimit: number; // 玩家回合的时间限制（秒）
}
