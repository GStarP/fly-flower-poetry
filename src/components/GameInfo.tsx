/**
 * 游戏信息组件
 */

import type { GameState } from '../modules/game';

interface GameInfoProps {
  gameState: GameState;
}

/**
 * 游戏信息组件
 */
export default function GameInfo({ gameState }: GameInfoProps) {
  // 获取当前回合数
  const getCurrentRound = () => {
    return Math.ceil(gameState.usedSentences.length / 2);
  };

  // 格式化剩余时间
  const formatRemainingTime = () => {
    if (gameState.remainingTime === undefined) return null;
    return `${gameState.remainingTime}秒`;
  };

  // 获取当前状态文本
  const getStatusText = () => {
    if (gameState.status === 'ready') return '准备开始';
    if (gameState.status === 'ended') return '游戏结束';
    return gameState.currentTurn === 'player' ? '玩家回合' : '机器人回合';
  };

  return (
    <div className="game-info">
      {gameState.status !== 'ready' && (
        <>
          <div className="info-item">
            <span className="label">回合</span>
            <span className="value">{getCurrentRound()}</span>
          </div>
          
          <div className="info-item">
            <span className="label">状态</span>
            <span className="value status">{getStatusText()}</span>
          </div>
          
          {gameState.status === 'playing' && gameState.currentTurn === 'player' && gameState.remainingTime !== undefined && (
            <div className="info-item">
              <span className="label">时间</span>
              <span className={`value time ${gameState.remainingTime <= 10 ? 'urgent' : ''}`}>
                {formatRemainingTime()}
              </span>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .game-info {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 14px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .label {
          color: #B0ABA9;
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .value {
          color: #1D1E20;
          font-weight: medium;
          font-size: 16px; /* 统一字体大小 */
        }
        
        .limit-char {
          font-size: 16px; /* 与其他值保持一致 */
          font-weight: bold;
          color: #C14C3A;
        }
        
        .status {
          color: #7AACB7;
        }
        
        .time {
          color: #789262;
        }
        
        .time.urgent {
          color: #C14C3A;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @media (max-width: 480px) {
          .game-info {
            gap: 10px;
          }
          
          .label {
            font-size: 11px;
          }
          
          .value {
            font-size: 14px;
          }
          
          .limit-char {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}