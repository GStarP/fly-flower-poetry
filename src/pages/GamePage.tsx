/**
 * 游戏主页面组件
 */

import { useState, useEffect } from "react";
import type { GameSettings, GameTurnResult } from "../modules/game";
import { useGame } from "../modules/game";
import CharacterSelector from "../components/CharacterSelector";
import PoetryChatList from "../components/PoetryChatList";
import PoetryInput from "../components/PoetryInput";
import GameInfo from "../components/GameInfo";
import GameResult from "../components/GameResult";
import ToastNotification from "../components/ToastNotification";
import LoadingIndicator from "../components/LoadingIndicator";

/**
 * 游戏主页面组件
 */
export default function GamePage() {
  // 使用游戏Hook
  const {
    loading,
    error,
    gameState,
    startNewGame,
    playerTurn,
    robotTurn,
    resetGame,
  } = useGame();

  // 本地状态
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const [showCharSelector, setShowCharSelector] = useState<boolean>(true);

  // 处理游戏开始
  const handleGameStart = (char: string, settings?: Partial<GameSettings>) => {
    startNewGame(char, settings);
    setShowCharSelector(false);
  };

  // 处理玩家回合
  const handlePlayerTurn = async (content: string) => {
    const result = await playerTurn(content);
    handleTurnResult(result);

    // 如果玩家回合成功且游戏未结束，触发机器人回合
    if (result.success && gameState.status === "playing") {
      setTimeout(handleRobotTurn, 500); // 短暂延迟，提升用户体验
    }
  };

  // 处理机器人回合
  const handleRobotTurn = async () => {
    const result = await robotTurn();
    handleTurnResult(result);
  };

  // 处理回合结果
  const handleTurnResult = (result: GameTurnResult) => {
    if (!result.success) {
      setToast({ type: "error", message: result.message || "操作失败" });
    }
  };

  // 处理游戏重启
  const handleRestart = () => {
    resetGame();
    setShowCharSelector(true);
  };

  // 清除Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 处理错误
  useEffect(() => {
    if (error) {
      setToast({ type: "error", message: error });
    }
  }, [error]);

  // 渲染加载状态
  if (loading) {
    return <LoadingIndicator message="正在加载诗词数据库..." />;
  }

  return (
    <div className="game-page">
      {/* 顶部信息 */}
      <header>
        <h1>飞花令</h1>
        {gameState.status !== "ready" && gameState.limitChar && (
          <div className="limit-char-container">
            <span className="limit-char">{gameState.limitChar}</span>
          </div>
        )}
        <GameInfo gameState={gameState} />
      </header>

      {/* 主要内容区 */}
      <main>
        <div className="scrollable-content">
          {/* 诗句对话列表 */}
          <PoetryChatList
            sentences={gameState.usedSentences}
            limitChar={gameState.limitChar}
          />

          {/* 游戏结果 */}
          {gameState.status === "ended" && gameState.result && (
            <GameResult
              result={gameState.result}
              onRestart={handleRestart}
              limitChar={gameState.limitChar}
            />
          )}
        </div>
      </main>

      {/* 底部输入区或重新开始按钮 */}
      <footer>
        {gameState.status === "ended" ? (
          <button className="restart-btn" onClick={handleRestart}>
            重新来过
          </button>
        ) : (
          <PoetryInput
            onSubmit={handlePlayerTurn}
            limitChar={gameState.limitChar}
            disabled={
              gameState.status !== "playing" || gameState.currentTurn !== "player"
            }
          />
        )}
      </footer>

      {/* 限定字选择弹窗 */}
      {showCharSelector && <CharacterSelector onSelect={handleGameStart} />}

      {/* Toast提示 */}
      {toast && <ToastNotification type={toast.type} message={toast.message} />}

      <style jsx>{`
        .game-page {
          display: flex;
          flex-direction: column;
          height: 100vh; /* 使用固定高度而不是最小高度 */
          background-color: #f7f4ed;
          background-image: url("/assets/paper-texture.svg");
          background-repeat: repeat;
          font-family: "Source Han Serif", serif;
          overflow: hidden; /* 防止整个页面滚动 */
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(176, 171, 169, 0.5);
          position: relative;
          flex-shrink: 0; /* 防止header被压缩 */
        }

        .limit-char-container {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }

        .limit-char {
          font-size: 28px;
          font-weight: bold;
          color: #c14c3a;
        }

        h1 {
          color: #1d1e20;
          font-weight: bold;
          margin: 0;
        }

        main {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 0; /* 配合flex: 1使其占据剩余空间 */
          overflow: hidden; /* 防止main本身滚动 */
        }

        .scrollable-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto; /* 使内容可滚动 */
          height: 100%; /* 占满main的高度 */
        }

        /* 自定义滚动条 */
        .scrollable-content::-webkit-scrollbar {
          width: 6px;
          display: none;
        }

        .scrollable-content::-webkit-scrollbar-track {
          background: rgba(176, 171, 169, 0.1);
        }

        .scrollable-content::-webkit-scrollbar-thumb {
          background-color: rgba(176, 171, 169, 0.5);
          border-radius: 3px;
        }

        footer {
          padding: 20px;
          border-top: 1px solid rgba(176, 171, 169, 0.5);
          flex-shrink: 0; /* 防止footer被压缩 */
        }
        
        footer .restart-btn {
          display: block;
          width: 100%;
          padding: 12px;
          background-color: #c14c3a;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-family: "Source Han Serif", serif;
          transition: background-color 0.3s;
        }
        
        footer .restart-btn:hover {
          background-color: #a13c2a;
        }

        @media (min-width: 768px) {
          main {
            width: 90%;
            margin: 0 auto;
          }

          footer {
            width: 90%;
            margin: 0 auto;
          }
        }

        @media (min-width: 1024px) {
          main {
            width: 800px;
          }

          footer {
            width: 800px;
          }
        }
      `}</style>
    </div>
  );
}
