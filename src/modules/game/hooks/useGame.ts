/**
 * 游戏逻辑Hook
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useDatabase } from "../../data/hooks/useDatabase";
import { createGameModule, type GameModuleInterface } from "../core/GameModule";
import type { GameSettings, GameState, GameTurnResult } from "../types";

/**
 * 游戏Hook返回值接口
 */
export interface UseGameReturn {
  // 状态
  loading: boolean;
  error: string | null;
  gameState: GameState;

  // 操作方法
  startNewGame: (limitChar: string, settings?: Partial<GameSettings>) => void;
  playerTurn: (input: string) => Promise<GameTurnResult>;
  robotTurn: () => Promise<GameTurnResult>;
  resetGame: () => void;
}

/**
 * 游戏逻辑Hook
 * @returns 游戏Hook返回值
 */
export const useGame = (): UseGameReturn => {
  // 使用数据库Hook
  const {
    loading: dbLoading,
    error: dbError,
    initialized,
    queryPoetrySentences,
    getPoetryById,
  } = useDatabase();

  // 状态
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: "ready",
    limitChar: "",
    currentTurn: "player",
    usedSentences: [],
  });

  // 游戏模块引用
  const gameModuleRef = useRef<GameModuleInterface | null>(null);

  // 初始化游戏模块
  useEffect(() => {
    if (initialized && !dbLoading && !dbError) {
      try {
        // 创建游戏模块实例
        const dataModule = {
          queryPoetrySentences,
          getPoetryById,
          initDatabase: async () => false,
        };
        gameModuleRef.current = createGameModule(dataModule);
        setLoading(false);
      } catch (err) {
        setError("初始化游戏模块失败");
        console.error("初始化游戏模块失败:", err);
        setLoading(false);
      }
    }
  }, [initialized, dbLoading, dbError, queryPoetrySentences, getPoetryById]);

  // 游戏状态更新函数
  const updateGameState = useCallback(() => {
    if (gameModuleRef.current) {
      setGameState(gameModuleRef.current.getGameState());
    }
  }, []);
  
  // 定期更新游戏状态，确保计时器更新能够反映在UI上
  useEffect(() => {
    // 每秒更新一次游戏状态
    const intervalId = setInterval(() => {
      if (gameState.status === 'playing' && gameState.currentTurn === 'player') {
        updateGameState();
      }
    }, 500); // 每500毫秒更新一次，确保UI平滑更新
    
    return () => clearInterval(intervalId);
  }, [gameState.status, gameState.currentTurn, updateGameState]);

  // 开始新游戏
  const startNewGame = useCallback(
    async (limitChar: string, settings?: Partial<GameSettings>) => {
      if (gameModuleRef.current) {
        try {
          gameModuleRef.current.startNewGame(limitChar, settings);
          updateGameState();
          
          // 如果由机器人先手，则先进行机器人回合
          const currentState = gameModuleRef.current.getGameState();
          if (currentState.currentTurn === "robot" && currentState.status === "playing") {
            // 使用异步方式执行机器人回合，并在完成后更新游戏状态
            const result = await gameModuleRef.current.robotTurn();
            updateGameState();
            // 如果机器人回合失败，显示错误信息
            if (!result.success) {
              setError(result.message || "机器人回合处理失败");
            }
          }
        } catch (err) {
          setError("开始新游戏失败");
          console.error("开始新游戏失败:", err);
        }
      }
    },
    [updateGameState]
  );

  // 玩家回合
  const playerTurn = useCallback(
    async (input: string): Promise<GameTurnResult> => {
      if (gameModuleRef.current) {
        try {
          const result = await gameModuleRef.current.playerTurn(input);
          updateGameState();
          return result;
        } catch (err) {
          const errorMsg = "玩家回合处理失败";
          setError(errorMsg);
          console.error(errorMsg, err);
          return { success: false, message: errorMsg };
        }
      }
      return { success: false, message: "游戏模块未初始化" };
    },
    [updateGameState]
  );

  // 机器人回合
  const robotTurn = useCallback(async (): Promise<GameTurnResult> => {
    if (gameModuleRef.current) {
      try {
        const result = await gameModuleRef.current.robotTurn();
        updateGameState();
        return result;
      } catch (err) {
        const errorMsg = "机器人回合处理失败";
        setError(errorMsg);
        console.error(errorMsg, err);
        return { success: false, message: errorMsg };
      }
    }
    return { success: false, message: "游戏模块未初始化" };
  }, [updateGameState]);

  // 重置游戏
  const resetGame = useCallback(() => {
    if (gameModuleRef.current) {
      try {
        gameModuleRef.current.resetGame();
        updateGameState();
      } catch (err) {
        setError("重置游戏失败");
        console.error("重置游戏失败:", err);
      }
    }
  }, [updateGameState]);

  // 返回Hook值
  return {
    loading: loading || dbLoading,
    error: error || dbError,
    gameState,
    startNewGame,
    playerTurn,
    robotTurn,
    resetGame,
  };
};
