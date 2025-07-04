/**
 * 游戏逻辑模块核心实现
 */

import type { DataModuleInterface } from "../../data/core/DataModule";
import type { Sentence } from "../../data/types";
import type {
  GameResult,
  GameSettings,
  GameState,
  GameTurnResult,
  PlayerType,
} from "../types";
import { GAME_CONSTANTS } from "./consts";

/**
 * 游戏逻辑模块接口
 */
export interface GameModuleInterface {
  /**
   * 开始新游戏
   * @param limitChar 限制字符
   * @param settings 游戏设置
   * @returns 游戏状态
   */
  startNewGame(limitChar: string, settings?: Partial<GameSettings>): GameState;

  /**
   * 机器人回合
   * @returns 游戏回合结果
   */
  robotTurn(): Promise<GameTurnResult>;

  /**
   * 玩家回合
   * @param input 玩家输入的诗句
   * @returns 游戏回合结果
   */
  playerTurn(input: string): Promise<GameTurnResult>;

  /**
   * 结束游戏
   * @param winner 获胜者
   * @param reason 结束原因
   * @returns 游戏结果
   */
  endGame(winner: PlayerType, reason: string): GameResult;

  /**
   * 获取当前游戏状态
   * @returns 游戏状态
   */
  getGameState(): GameState;

  /**
   * 重置游戏
   * @returns 游戏状态
   */
  resetGame(): GameState;
}

/**
 * 游戏逻辑模块实现类
 */
export class GameModule implements GameModuleInterface {
  private dataModule: DataModuleInterface;
  private gameState: GameState;
  private settings: GameSettings;
  private timer?: NodeJS.Timeout;

  /**
   * 构造函数
   * @param dataModule 数据管理模块实例
   */
  constructor(dataModule: DataModuleInterface) {
    this.dataModule = dataModule;
    this.settings = {
      difficulty: "medium",
      timeLimit: 15,
    };
    this.gameState = {
      status: GAME_CONSTANTS.STATUS.READY,
      limitChar: "",
      currentTurn: GAME_CONSTANTS.FIRST_TURN,
      usedSentences: [],
    };
  }

  /**
   * 开始新游戏
   * @param limitChar 限制字符
   * @param settings 游戏设置
   * @returns 游戏状态
   */
  startNewGame(limitChar: string, settings?: Partial<GameSettings>): GameState {
    // 清除现有计时器
    this.clearTimer();

    // 更新游戏设置
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }

    // 初始化游戏状态
    this.gameState = {
      status: GAME_CONSTANTS.STATUS.PLAYING,
      limitChar,
      currentTurn: GAME_CONSTANTS.FIRST_TURN,
      usedSentences: [],
      remainingTime: this.settings.timeLimit,
    };

    // 如果玩家先手，启动计时器
    if (this.gameState.currentTurn === "player") {
      this.startTimer();
    }

    return this.getGameState();
  }

  /**
   * 机器人回合
   * @returns 游戏回合结果
   */
  async robotTurn(): Promise<GameTurnResult> {
    // 检查游戏状态
    if (
      this.gameState.status !== GAME_CONSTANTS.STATUS.PLAYING ||
      this.gameState.currentTurn !== "robot"
    ) {
      return {
        success: false,
        message: GAME_CONSTANTS.ERROR_MESSAGES.NOT_ROBOT_TURN,
      };
    }

    // 清除玩家计时器
    this.clearTimer();

    try {
      // 查询包含限制字符的诗句
      const sentences = await this.dataModule.queryPoetrySentences(
        this.gameState.limitChar,
        this.gameState.usedSentences.map((sentence) => sentence.id)
      );

      // 如果没有可用诗句，机器人认输
      if (sentences.length === 0) {
        const result = this.endGame(
          "player",
          GAME_CONSTANTS.ERROR_MESSAGES.NO_AVAILABLE_SENTENCES
        );
        return { success: false, message: result.reason, gameOver: true };
      }

      // 根据难度选择诗句
      const sentence = this.selectSentenceByDifficulty(sentences);

      // 更新游戏状态
      this.gameState.usedSentences.push(sentence);
      this.gameState.currentTurn = "player";
      this.gameState.remainingTime = this.settings.timeLimit;

      // 重新启动计时器
      this.startTimer();

      return { success: true, sentence };
    } catch (error) {
      console.error("机器人回合出错:", error);
      return {
        success: false,
        message: GAME_CONSTANTS.ERROR_MESSAGES.ROBOT_ERROR,
      };
    }
  }

  /**
   * 玩家回合
   * @param input 玩家输入的诗句
   * @returns 游戏回合结果
   */
  async playerTurn(input: string): Promise<GameTurnResult> {
    // 检查游戏状态
    if (
      this.gameState.status !== GAME_CONSTANTS.STATUS.PLAYING ||
      this.gameState.currentTurn !== "player"
    ) {
      return {
        success: false,
        message: GAME_CONSTANTS.ERROR_MESSAGES.NOT_PLAYER_TURN,
      };
    }

    // 清除计时器
    this.clearTimer();

    // 验证输入是否包含限制字符
    if (!input.includes(this.gameState.limitChar)) {
      // 重新启动计时器，因为玩家回合继续
      this.startTimer();
      return {
        success: false,
        message: `${GAME_CONSTANTS.ERROR_MESSAGES.NOT_INCLUDE_LIMIT_CHAR}"${this.gameState.limitChar}"`,
      };
    }

    // 验证输入是否已存在于使用过的句子中
    if (
      this.gameState.usedSentences.some(
        (sentence) => sentence.content === input
      )
    ) {
      // 重新启动计时器，因为玩家回合继续
      this.startTimer();
      return {
        success: false,
        message: GAME_CONSTANTS.ERROR_MESSAGES.SENTENCE_ALREADY_USED,
      };
    }

    try {
      // 查询匹配的诗句
      const sentences = await this.dataModule.queryPoetrySentences(
        input,
        this.gameState.usedSentences.map((sentence) => sentence.id)
      );

      // 恰好匹配到一句，认为用户输入正确
      if (sentences.length === 1) {
        // 更新游戏状态
        this.gameState.usedSentences.push(sentences[0]);
        this.gameState.currentTurn = "robot";

        // 玩家回合成功，不需要重新启动计时器，因为下一回合是机器人

        return {
          success: true,
          sentence: sentences[0],
        };
      }
      // 匹配不到任何诗句，认为用户输入无效
      else if (sentences.length === 0) {
        // 重新启动计时器，因为玩家回合继续
        this.startTimer();
        return {
          success: false,
          message: GAME_CONSTANTS.ERROR_MESSAGES.NO_MATCHING_SENTENCE,
        };
      }
      // 匹配到多句诗句，要求用户输入更具体的诗句
      else {
        // 重新启动计时器，因为玩家回合继续
        this.startTimer();
        return {
          success: false,
          message: GAME_CONSTANTS.ERROR_MESSAGES.MULTIPLE_MATCHING_SENTENCES,
        };
      }
    } catch (error) {
      console.error("玩家回合出错:", error);
      // 重新启动计时器，因为玩家回合继续
      this.startTimer();
      return {
        success: false,
        message: GAME_CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR,
      };
    }
  }

  /**
   * 结束游戏
   * @param winner 获胜者
   * @param reason 结束原因
   * @returns 游戏结果
   */
  endGame(winner: PlayerType, reason: string): GameResult {
    // 清除计时器
    this.clearTimer();

    // 更新游戏状态
    this.gameState.status = GAME_CONSTANTS.STATUS.ENDED;

    // 创建游戏结果
    const result: GameResult = { winner, reason };

    // 如果玩家输了，提供推荐诗句
    if (winner === "robot") {
      // 异步获取推荐诗句
      this.getRecommendedSentences()
        .then((sentences) => {
          if (sentences.length > 0) {
            result.recommendedSentences = sentences;
            this.gameState.result = {
              ...result,
              recommendedSentences: sentences,
            };
          }
        })
        .catch((error) => {
          console.error("获取推荐诗句出错:", error);
        });
    }

    // 设置游戏结果
    this.gameState.result = result;

    return result;
  }

  /**
   * 获取当前游戏状态
   * @returns 游戏状态
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * 重置游戏
   * @returns 游戏状态
   */
  resetGame(): GameState {
    // 清除计时器
    this.clearTimer();

    // 重置游戏状态
    this.gameState = {
      status: GAME_CONSTANTS.STATUS.READY,
      limitChar: "",
      currentTurn: GAME_CONSTANTS.FIRST_TURN,
      usedSentences: [],
    };

    return this.getGameState();
  }

  /**
   * 启动计时器
   * @private
   */
  private startTimer(): void {
    // 只在玩家回合启动计时器
    if (
      this.gameState.status === GAME_CONSTANTS.STATUS.PLAYING &&
      this.gameState.currentTurn === "player"
    ) {
      // 清除现有计时器
      this.clearTimer();

      // 确保remainingTime已设置
      if (this.gameState.remainingTime === undefined) {
        this.gameState.remainingTime = this.settings.timeLimit;
      }

      // 设置计时器
      this.timer = setInterval(() => {
        if (this.gameState.remainingTime && this.gameState.remainingTime > 0) {
          // 创建一个新的gameState对象，以确保React能检测到变化
          this.gameState = {
            ...this.gameState,
            remainingTime: this.gameState.remainingTime - 1,
          };
        } else {
          // 时间到，玩家输了
          this.clearTimer();
          this.endGame("robot", GAME_CONSTANTS.ERROR_MESSAGES.PLAYER_TIMEOUT);
        }
      }, 1000);
    }
  }

  /**
   * 清除计时器
   * @private
   */
  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * 根据难度选择诗句
   * @param sentences 可用诗句列表
   * @returns 选中的诗句
   * @private
   */
  private selectSentenceByDifficulty(sentences: Sentence[]): Sentence {
    if (sentences.length === 0) {
      throw new Error(GAME_CONSTANTS.ERROR_MESSAGES.NO_AVAILABLE_SENTENCE);
    }

    // 暂时忽视 难度设置，直接采用第一句
    return sentences[0];
  }

  /**
   * 获取推荐诗句
   * @returns 推荐诗句列表
   * @private
   */
  private async getRecommendedSentences(): Promise<Sentence[]> {
    try {
      // 查询包含限制字符的诗句
      const sentences = await this.dataModule.queryPoetrySentences(
        this.gameState.limitChar,
        this.gameState.usedSentences.map((used) => used.id)
      );

      // 返回3个推荐诗句
      return sentences.slice(0, 3);
    } catch (error) {
      console.error("获取推荐诗句出错:", error);
      return [];
    }
  }
}

// 导出游戏模块实例
export const createGameModule = (
  dataModule: DataModuleInterface
): GameModuleInterface => {
  return new GameModule(dataModule);
};
