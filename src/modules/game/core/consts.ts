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
    NOT_ROBOT_TURN: "当前不是机器人回合",
    NOT_PLAYER_TURN: "当前不是玩家回合",
    SENTENCE_ALREADY_USED: "已经过说过啦，请换一句吧",
    NO_MATCHING_SENTENCE: "未找到匹配的诗句，请输入正确的古诗词句",
    MULTIPLE_MATCHING_SENTENCES: "匹配的诗句不唯一，请输入更具体的诗句",
    VALIDATION_ERROR: "验证诗句时出现错误",
    ROBOT_ERROR: "机器人思考时出现错误",
    NO_AVAILABLE_SENTENCES: "机器人无法找到包含限制字符的诗句",
    PLAYER_TIMEOUT: "玩家超时未作答",
    NO_AVAILABLE_SENTENCE: "没有可用的诗句",
    NOT_INCLUDE_LIMIT_CHAR: "未包含限制字符",
  },
};
