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
      setTimeout(handleRobotTurn, 100);
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
        <div className="header-left">
          <h1>飞花令</h1>
          <a
            href="https://github.com/GStarP/fly-flower-poetry"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="查看源码"
          >
            <svg
               width="24"
               height="24"
               viewBox="0 0 24 24"
               fill="currentColor"
               className="github-icon"
             >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
        {gameState.status !== "ready" && gameState.limitChar && (
          <div className="limit-char-container">
            <span className="limit-char">{gameState.limitChar}</span>
          </div>
        )}
        <div className="header-right">
          <GameInfo gameState={gameState} />
        </div>
      </header>

      {/* 主要内容区 */}
      <main>
        <div className="scrollable-content">
          {/* 诗句对话列表 */}
          <PoetryChatList
            sentences={gameState.usedSentences}
            limitChar={gameState.limitChar}
            gameStatus={gameState.status}
          />

          {/* 游戏结果 */}
          {gameState.status === "ended" && gameState.result && (
            <GameResult
              result={gameState.result}
              onRestart={handleRestart}
              limitChar={gameState.limitChar}
              gameState={gameState}
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

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .github-link {
          color: #1d1e20;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: color 0.3s ease;
        }

        .github-link:hover {
          color: #c14c3a;
        }

        .github-icon {
           width: 24px;
           height: 24px;
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
