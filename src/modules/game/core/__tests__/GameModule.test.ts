/**
 * 游戏逻辑模块单元测试
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { GameModule, type GameModuleInterface } from "../GameModule";
import { GAME_CONSTANTS } from "../consts";
import type { DataModuleInterface } from "../../../data/core/DataModule";
import type { Sentence } from "../../../data/types";
import type { PlayerType } from "../../types";

// 模拟数据模块
const mockSentences: Sentence[] = [
  { id: 1, content: "床前明月光", poetryId: 1, poetryIndex: 0 },
  { id: 2, content: "疑是地上霜", poetryId: 1, poetryIndex: 1 },
  { id: 3, content: "举头望明月", poetryId: 1, poetryIndex: 2 },
  { id: 4, content: "低头思故乡", poetryId: 1, poetryIndex: 3 },
  { id: 5, content: "春眠不觉晓", poetryId: 2, poetryIndex: 0 },
  { id: 6, content: "处处闻啼鸟", poetryId: 2, poetryIndex: 1 },
  { id: 7, content: "夜来风雨声", poetryId: 2, poetryIndex: 2 },
  { id: 8, content: "花落知多少", poetryId: 2, poetryIndex: 3 },
];

const skipFirstRobotTurn = async (gameModule: GameModuleInterface) => {
  (
    mockDataModule.queryPoetrySentences as ReturnType<typeof vi.fn>
  ).mockResolvedValueOnce([
    {
      id: -1,
      content: "跳过第一回合",
      poetryId: -1,
      poetryIndex: 0,
    },
  ]);
  await gameModule.robotTurn();
};

const mockDataModule: DataModuleInterface = {
  initDatabase: vi.fn().mockResolvedValue(undefined),
  queryPoetrySentences: vi.fn().mockImplementation((query: string) => {
    return Promise.resolve(
      mockSentences.filter((s) => s.content.includes(query))
    );
  }),
  getPoetryById: vi.fn().mockImplementation((id: number) => {
    return Promise.resolve({
      id,
      title: "测试诗词",
      author: "测试作者",
      paragraphs: mockSentences
        .filter((s) => s.poetryId === id)
        .map((s) => s.content),
    });
  }),
};

// 模拟计时器
vi.useFakeTimers();

describe("GameModule", () => {
  let gameModule: GameModuleInterface;

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks();
    // 创建游戏模块实例
    gameModule = new GameModule(mockDataModule);
  });

  test("应该正确初始化游戏状态", () => {
    const state = gameModule.getGameState();
    expect(state.status).toBe(GAME_CONSTANTS.STATUS.READY);
    expect(state.limitChar).toBe("");
    expect(state.currentTurn).toBe(GAME_CONSTANTS.FIRST_TURN); // 初始状态为机器人先手
    expect(state.usedSentences).toEqual([]);
  });

  test("应该正确开始新游戏", () => {
    const limitChar = "月";
    const state = gameModule.startNewGame(limitChar, {
      difficulty: "easy",
      timeLimit: 20,
    });

    expect(state.status).toBe(GAME_CONSTANTS.STATUS.PLAYING);
    expect(state.limitChar).toBe(limitChar);
    expect(state.currentTurn).toBe(GAME_CONSTANTS.FIRST_TURN); // 机器人先手
    expect(state.usedSentences).toEqual([]);
    expect(state.remainingTime).toBe(20);
  });

  test("玩家回合应该正确处理有效输入", async () => {
    // 开始新游戏
    gameModule.startNewGame("月");

    // 由于初始是机器人回合，需要先让机器人完成一个回合
    await skipFirstRobotTurn(gameModule);

    // 玩家输入有效诗句
    const result = await gameModule.playerTurn("床前明月光");

    // 验证结果
    expect(result.success).toBe(true);
    expect(result.sentence).toEqual(mockSentences[0]);

    // 验证游戏状态更新
    const state = gameModule.getGameState();
    expect(state.currentTurn).toBe("robot");
    expect(state.usedSentences).toContainEqual(mockSentences[0]);
  });

  test("玩家回合应该拒绝不包含限制字符的输入", async () => {
    // 开始新游戏
    gameModule.startNewGame("花");

    // 由于初始是机器人回合，需要先让机器人完成一个回合
    await skipFirstRobotTurn(gameModule);

    // 记录用户输入前的游戏状态
    const prevState = gameModule.getGameState();

    // 玩家输入不包含限制字符的诗句
    const result = await gameModule.playerTurn("床前明月光");

    // 验证结果
    expect(result.success).toBe(false);
    expect(result.message).toContain(
      GAME_CONSTANTS.ERROR_MESSAGES.NOT_INCLUDE_LIMIT_CHAR
    );

    // 验证游戏状态未变
    const state = gameModule.getGameState();
    expect(state.currentTurn).toBe(prevState.currentTurn);
    expect(state.usedSentences).toEqual(prevState.usedSentences);
  });

  test("玩家回合应该拒绝重复使用的诗句", async () => {
    // 开始新游戏
    gameModule.startNewGame("月");

    // 由于初始是机器人回合，需要先让机器人完成一个回合
    await skipFirstRobotTurn(gameModule);

    // 第一次使用诗句
    await gameModule.playerTurn("床前明月光");

    // 机器人回合，切换回玩家回合
    await gameModule.robotTurn();

    // 再次使用相同诗句
    const result = await gameModule.playerTurn("床前明月光");

    // 验证结果
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      GAME_CONSTANTS.ERROR_MESSAGES.SENTENCE_ALREADY_USED
    );
  });

  test("机器人回合应该正确选择诗句", async () => {
    // 开始新游戏
    gameModule.startNewGame("月");

    // 执行机器人回合
    const result = await gameModule.robotTurn();

    // 验证结果
    expect(result.success).toBe(true);
    expect(result.sentence).toBeDefined();
    expect(result.sentence?.content.includes("月")).toBe(true);

    // 验证游戏状态更新
    const state = gameModule.getGameState();
    expect(state.currentTurn).toBe("player");
    expect(state.usedSentences).toContainEqual(result.sentence);
  });

  test("机器人回合应该在没有可用诗句时结束游戏", async () => {
    // 修改模拟函数返回空数组
    (
      mockDataModule.queryPoetrySentences as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([]);

    // 开始新游戏
    gameModule.startNewGame("月");

    // 设置为机器人回合
    (gameModule as any).gameState.currentTurn = "robot";

    // 执行机器人回合
    const result = await gameModule.robotTurn();

    // 验证结果
    expect(result.success).toBe(false);
    expect(result.gameOver).toBe(true);

    // 验证游戏状态更新
    const state = gameModule.getGameState();
    expect(state.status).toBe(GAME_CONSTANTS.STATUS.ENDED);
    expect(state.result?.winner).toBe("player");
  });

  test("玩家超时应该结束游戏", async () => {
    // 开始新游戏
    gameModule.startNewGame("月", { timeLimit: 10 });

    // 由于初始是机器人回合，需要先让机器人完成一个回合
    await skipFirstRobotTurn(gameModule);

    // 确保游戏状态为玩家回合，并且计时器已启动
    const stateAfterRobotTurn = gameModule.getGameState();
    expect(stateAfterRobotTurn.currentTurn).toBe("player");
    expect(stateAfterRobotTurn.remainingTime).toBe(10);

    // 快进时间
    (gameModule as any).gameState.remainingTime = 0;
    vi.advanceTimersByTime(10000);

    // 验证游戏状态更新
    const state = gameModule.getGameState();
    expect(state.status).toBe(GAME_CONSTANTS.STATUS.ENDED);
    expect(state.result?.winner).toBe("robot");
    expect(state.result?.reason).toBe(
      GAME_CONSTANTS.ERROR_MESSAGES.PLAYER_TIMEOUT
    );
  });

  test("重置游戏应该恢复初始状态", () => {
    // 开始新游戏
    gameModule.startNewGame("月");

    // 重置游戏
    const state = gameModule.resetGame();

    // 验证状态
    expect(state.status).toBe(GAME_CONSTANTS.STATUS.READY);
    expect(state.limitChar).toBe("");
    expect(state.currentTurn).toBe(GAME_CONSTANTS.FIRST_TURN); // 初始状态为机器人先手
    expect(state.usedSentences).toEqual([]);
  });

  test("结束游戏应该正确设置结果", () => {
    // 开始新游戏
    gameModule.startNewGame("月");

    // 结束游戏
    const winner: PlayerType = "player";
    const reason = "测试原因";
    const result = gameModule.endGame(winner, reason);

    // 验证结果
    expect(result.winner).toBe(winner);
    expect(result.reason).toBe(reason);

    // 验证游戏状态更新
    const state = gameModule.getGameState();
    expect(state.status).toBe(GAME_CONSTANTS.STATUS.ENDED);
    expect(state.result).toEqual(result);
  });
});
