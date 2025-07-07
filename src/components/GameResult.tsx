/**
 * 游戏结果组件
 */

import { useState, useEffect } from "react";
import { GAME_CONSTANTS, type GameResult as GameResultType, type GameState } from "../modules/game";
import type { Sentence } from "../modules/data";
import { dataModule } from "../modules/data";
import { openPoetrySearch } from "../utils/poetry";

interface GameResultProps {
  result: GameResultType;
  onRestart: () => void;
  limitChar?: string;
  gameState?: GameState;
}

/**
 * 游戏结果组件
 */
export default function GameResult({
  result,
  limitChar,
  gameState,
}: GameResultProps) {
  const [currentRecommendedSentences, setCurrentRecommendedSentences] = useState<Sentence[]>(result.recommendedSentences || []);
  const [isLoadingNewSentences, setIsLoadingNewSentences] = useState(false);
  // 获取结果标题
  const getResultTitle = () => {
    return result.winner === "player"
      ? GAME_CONSTANTS.RESULT_TEXT.WIN
      : GAME_CONSTANTS.RESULT_TEXT.LOSE;
  };

  // 换一批推荐诗句
  const handleRefreshSentences = async () => {
    if (!limitChar || isLoadingNewSentences) return;
    
    setIsLoadingNewSentences(true);
    try {
      // 获取已使用的诗句ID，包括当前显示的推荐诗句
      const usedIds = [...(gameState?.usedSentences?.map(s => s.id) || []), ...currentRecommendedSentences.map(s => s.id)];
      
      // 查询新的推荐诗句
      const newSentences = await dataModule.queryPoetrySentences(
        limitChar,
        usedIds,
        3
      );
      
      setCurrentRecommendedSentences(newSentences);
    } catch (error) {
      console.error("获取新推荐诗句失败:", error);
    } finally {
      setIsLoadingNewSentences(false);
    }
  };

  // 渲染推荐诗句
  const renderRecommendedSentences = () => {
    if (
      !currentRecommendedSentences ||
      currentRecommendedSentences.length === 0
    ) {
      return null;
    }

    return (
      <div className="recommended-sentences">
        <div className="sentences-header">
          <span className="sentences-title">推荐诗句</span>
          <button 
            className="refresh-button"
            onClick={handleRefreshSentences}
            disabled={isLoadingNewSentences}
          >
            {isLoadingNewSentences ? "加载中..." : "换一批"}
          </button>
        </div>
        <div className="sentences-list">
          {currentRecommendedSentences.map((sentence, index) => (
            <RecommendedSentenceItem key={`${sentence.id}-${index}`} sentence={sentence} />
          ))}
        </div>
      </div>
    );
  };

  // 高亮显示限定字
  const highlightContent = (content: string, char: string) => {
    if (!char) return content;

    const parts = content.split(char);
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {index > 0 && <span className="highlight">{char}</span>}
            {part}
          </span>
        ))}
      </>
    );
  };

  // 推荐诗句项组件
  const RecommendedSentenceItem = ({ sentence }: { sentence: any }) => {
    const [poetry, setPoetry] = useState<any>(null);

    // 获取诗词详情
    useEffect(() => {
      const fetchPoetry = async () => {
        try {
          const poetryData = await dataModule.getPoetryById(sentence.poetryId);
          setPoetry(poetryData);
        } catch (error) {
          console.error("获取诗词详情失败:", error);
        }
      };

      fetchPoetry();
    }, [sentence.poetryId]);

    return (
      <div className="sentence-item">
        <div className="sentence-content">
          {limitChar
            ? highlightContent(sentence.content, limitChar)
            : sentence.content}
        </div>
        {poetry && (
          <div 
            className="sentence-source"
            onClick={() => openPoetrySearch(poetry.title, poetry.author)}
          >
            《{poetry.title}》 {poetry.author}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-result">
      <div className="result-content">
        <h2 className={`result-title ${result.winner}`}>{getResultTitle()}</h2>
        <p className="result-reason">{result.reason}</p>

        {result.winner === "robot" && renderRecommendedSentences()}
      </div>

      <style jsx global>{`
        .game-result {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px dashed rgba(176, 171, 169, 0.5);
          animation: fadeIn 0.5s ease-out;
          width: 100%;
          box-sizing: border-box;
        }

        .result-content {
          background-color: rgba(247, 244, 237, 0.9);
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(176, 171, 169, 0.3);
          word-wrap: break-word;
          overflow-wrap: break-word;
          width: 100%;
          box-sizing: border-box;
        }

        .result-title {
          text-align: center;
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 24px;
        }

        .result-title.player {
          color: #789262;
        }

        .result-title.robot {
          color: #c14c3a;
        }

        .result-reason {
          text-align: center;
          color: #1d1e20;
          margin-bottom: 20px;
        }

        .recommended-sentences {
          margin-top: 20px;
          margin-bottom: 20px;
        }

        .sentences-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .sentences-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }

        .refresh-button {
          background-color: transparent;
          color: #333;
          border: 1px solid #333;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background-color: #333;
          color: white;
        }

        .refresh-button:disabled {
          border-color: #ccc;
          color: #ccc;
          cursor: not-allowed;
        }

        .sentences-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sentence-item {
          padding: 12px 15px;
          color: #333;
          font-size: 16px;
          border: 1px solid #e0d9c9;
          border-radius: 4px;
          transition: border-color 0.2s ease;
        }

        .sentence-content {
          font-size: 18px;
          margin-bottom: 6px;
        }

        .sentence-source {
          font-size: 12px;
          color: #777;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .sentence-source:hover {
          color: #333;
          text-decoration: underline;
        }

        .highlight {
          color: #c14c3a;
          font-weight: 500;
        }

        /* 重新开始按钮已移至底部 */

        /* 重新开始按钮悬停样式已移至底部 */

        /* 移动端适配 */
        @media (max-width: 480px) {
          .game-result {
            margin-top: 15px;
            padding-top: 15px;
          }
          
          .result-content {
            padding: 12px 10px;
          }
          
          .result-title {
            font-size: 20px;
            margin-bottom: 8px;
          }
          
          .result-reason {
            font-size: 14px;
            margin-bottom: 15px;
          }
          
          .sentences-title {
            font-size: 15px;
          }
          
          .refresh-button {
            padding: 5px 8px;
            font-size: 13px;
          }
          
          .sentences-list {
            gap: 10px;
          }
          
          .sentence-item {
            padding: 10px;
          }
          
          .sentence-content {
            font-size: 16px;
            margin-bottom: 4px;
          }
        }
        
        @media (max-width: 375px) {
          .game-result {
            margin-top: 12px;
            padding-top: 12px;
          }
          
          .result-content {
            padding: 12px 10px;
          }
          
          .result-title {
            font-size: 18px;
            margin-bottom: 6px;
          }
          
          .result-reason {
            font-size: 13px;
            margin-bottom: 12px;
          }
          
          .sentences-header {
            margin-bottom: 8px;
          }
          
          .sentences-title {
            font-size: 14px;
          }
          
          .refresh-button {
            padding: 4px 8px;
            font-size: 12px;
          }
          
          .sentences-list {
            gap: 8px;
          }
          
          .sentence-item {
            padding: 8px 10px;
          }
          
          .sentence-content {
            font-size: 15px;
            margin-bottom: 3px;
          }
          
          .sentence-source {
            font-size: 11px;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
