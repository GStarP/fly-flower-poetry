/**
 * 诗句对话项组件
 */

import { useState, useEffect } from "react";
import type { Sentence, Poetry } from "../modules/data";
import { dataModule } from "../modules/data";

interface PoetryChatItemProps {
  sentence: Sentence;
  type: "player" | "robot";
  highlightChar?: string;
}

/**
 * 诗句对话项组件
 */
export default function PoetryChatItem({
  sentence,
  type,
  highlightChar,
}: PoetryChatItemProps) {
  const [poetry, setPoetry] = useState<Poetry | null>(null);
  const [_loading, setLoading] = useState<boolean>(false);

  // 获取诗词详情
  useEffect(() => {
    const fetchPoetry = async () => {
      try {
        setLoading(true);
        const poetryData = await dataModule.getPoetryById(sentence.poetryId);
        setPoetry(poetryData);
      } catch (error) {
        console.error("获取诗词详情失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoetry();
  }, [sentence.poetryId]);

  // 高亮显示限定字
  const highlightContent = (content: string, char: string) => {
    if (!char) return content;

    const parts = content.split(char);
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {index > 0 && <span className="highlight__chat">{char}</span>}
            {part}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className={`poetry-chat-item ${type}`}>
      <div className="content">
        {highlightChar
          ? highlightContent(sentence.content, highlightChar)
          : sentence.content}
      </div>

      {poetry && (
        <div className="source">
          {poetry.title} · {poetry.author}
        </div>
      )}

      <style jsx>{`
        .poetry-chat-item {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 8px;
          position: relative;
          animation: fadeIn 0.3s ease-out;
        }

        .poetry-chat-item.robot {
          align-self: flex-start;
          background-color: #7aacb7;
          color: white;
          margin-left: 12px; /* 为尖角留出空间 */
        }

        .poetry-chat-item.robot::before {
          content: "";
          position: absolute;
          left: -12px;
          bottom: 10px;
          border-width: 6px 12px 6px 0;
          border-style: solid;
          border-color: transparent #7aacb7 transparent transparent;
        }

        .poetry-chat-item.player {
          align-self: flex-end;
          background-color: #789262;
          color: white;
          margin-right: 12px; /* 为尖角留出空间 */
        }

        .poetry-chat-item.player::before {
          content: "";
          position: absolute;
          right: -12px;
          bottom: 10px;
          border-width: 6px 0 6px 12px;
          border-style: solid;
          border-color: transparent transparent transparent #789262;
        }

        .content {
          font-size: 18px;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .source {
          font-size: 12px;
          opacity: 0.8;
        }

        :global(.highlight__chat) {
          color: #333;
          font-weight: 500;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) {
          .poetry-chat-item {
            max-width: 70%;
          }
        }
      `}</style>
    </div>
  );
}
