/**
 * 诗句对话列表组件
 */

import { useEffect, useRef } from "react";
import type { Sentence } from "../modules/data";
import PoetryChatItem from "./PoetryChatItem";

interface PoetryChatListProps {
  sentences: Sentence[];
  limitChar: string;
}

/**
 * 诗句对话列表组件
 */
export default function PoetryChatList({
  sentences,
  limitChar,
}: PoetryChatListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // 当新诗句添加时，滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [sentences]);

  return (
    <div className="poetry-chat-list" ref={listRef}>
      {sentences.length === 0 ? (
        <div className="empty-state">
          <p>游戏开始后，诗句将显示在这里</p>
          <p>每句诗都必须包含限定字「{limitChar || "?"}」</p>
        </div>
      ) : (
        sentences.map((sentence, index) => (
          <PoetryChatItem
            key={`${sentence.id}-${index}`}
            sentence={sentence}
            type={index % 2 === 0 ? "robot" : "player"}
            highlightChar={limitChar}
          />
        ))
      )}

      <style jsx>{`
        .poetry-chat-list {
          flex: 0 0 auto; /* 不再需要flex: 1，因为滚动由父容器处理 */
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #b0aba9;
          text-align: center;
          font-size: 16px;
          line-height: 1.6;
        }

        /* 滚动条样式已移至GamePage.tsx */
      `}</style>
    </div>
  );
}
