/**
 * 游戏逻辑模块常量定义
 */

import type { PlayerType, GameStatus } from "../types";

/**
 * 游戏常量定义
 */
export const GAME_CONSTANTS = {
  // 玩家类型
  FIRST_TURN: "robot" as PlayerType, // 先手玩家类型

  // 游戏状态
  STATUS: {
    READY: "ready" as GameStatus,
    PLAYING: "playing" as GameStatus,
    ENDED: "ended" as GameStatus,
  },

  // 错误信息
  ERROR_MESSAGES: {
    NOT_ROBOT_TURN: "非吾之回合",
    NOT_PLAYER_TURN: "非彼之回合",
    SENTENCE_ALREADY_USED: "此句已出，请君另择它句",
    NO_MATCHING_SENTENCE: "吾不识得此句",
    MULTIPLE_MATCHING_SENTENCES: "此句泛泛，未可作数",
    VALIDATION_ERROR: "天有误",
    ROBOT_ERROR: "吾有误",
    PLAYER_TIMEOUT: "白驹过隙，时限已至",
    NO_AVAILABLE_SENTENCE: "吾百思不得其解",
    NOT_INCLUDE_LIMIT_CHAR: "君未循飞花之令",
  },

  RESULT_TEXT: {
    WIN: '会当凌绝顶，一览众山小',
    LOSE: '胜败乃兵家常事，大侠请重新来过'
  }
};
