/**
 * 游戏结果组件
 */

import { useState, useEffect } from "react";
import type { GameResult as GameResultType } from "../modules/game";
import { dataModule } from "../modules/data";

interface GameResultProps {
  result: GameResultType;
  onRestart: () => void;
  limitChar?: string;
}

/**
 * 游戏结果组件
 */
export default function GameResult({
  result,
  onRestart,
  limitChar,
}: GameResultProps) {
  // 获取结果标题
  const getResultTitle = () => {
    return result.winner === "player"
      ? "会当凌绝顶，一览众山小"
      : "胜败乃兵家常事，大侠请重新来过";
  };

  // 渲染推荐诗句
  const renderRecommendedSentences = () => {
    if (
      !result.recommendedSentences ||
      result.recommendedSentences.length === 0
    ) {
      return null;
    }

    return (
      <div className="recommended-sentences">
        <div className="sentences-list">
          {result.recommendedSentences.map((sentence, index) => (
            <RecommendedSentenceItem key={index} sentence={sentence} />
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
          <div className="sentence-source">
            {poetry.title} · {poetry.author}
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
        }

        .result-content {
          background-color: rgba(247, 244, 237, 0.9);
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(176, 171, 169, 0.3);
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
        }

        .highlight {
          color: #c14c3a;
          font-weight: 500;
        }

        /* 重新开始按钮已移至底部 */

        /* 重新开始按钮悬停样式已移至底部 */

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
