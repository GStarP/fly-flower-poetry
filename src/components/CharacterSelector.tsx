/**
 * 限定字选择组件
 */

import { useState, useEffect } from 'react';
import type { GameSettings } from '../modules/game';

// 推荐的限定字列表
const DEFAULT_RECOMMENDED_CHARS = ['花', '月', '风', '雪', '山', '水', '云', '春', '秋'];

interface CharacterSelectorProps {
  onSelect: (char: string, settings?: Partial<GameSettings>) => void;
  onCancel?: () => void;
  recommendedChars?: string[];
  onRefreshRecommended?: () => void;
}

/**
 * 限定字选择组件
 */
export default function CharacterSelector({
  onSelect,
  onCancel,
  recommendedChars = DEFAULT_RECOMMENDED_CHARS,
  onRefreshRecommended,
}: CharacterSelectorProps) {
  const [inputChar, setInputChar] = useState<string>('');
  const [displayedChars, setDisplayedChars] = useState<string[]>([]);

  // 初始化显示的推荐字符
  useEffect(() => {
    refreshRecommendedChars();
  }, [recommendedChars]);

  // 刷新推荐字符
  const refreshRecommendedChars = () => {
    // 从推荐字符中随机选择3个
    const shuffled = [...recommendedChars].sort(() => 0.5 - Math.random());
    setDisplayedChars(shuffled.slice(0, 3));
    
    // 如果有外部刷新函数，也调用它
    if (onRefreshRecommended) {
      onRefreshRecommended();
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只取第一个字符
    const value = e.target.value;
    if (value.length > 0) {
      setInputChar(value.charAt(0));
    } else {
      setInputChar('');
    }
  };

  // 处理提交
  const handleSubmit = () => {
    if (inputChar) {
      onSelect(inputChar);
    }
  };

  // 处理选择推荐字符
  const handleSelectRecommended = (char: string) => {
    onSelect(char);
  };

  return (
    <div className="character-selector-overlay">
      <div className="character-selector">
        <h2>选择限定字</h2>
        
        <div className="input-section">
          <input
            type="text"
            value={inputChar}
            onChange={handleInputChange}
            placeholder="输入一个汉字"
            maxLength={1}
          />
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={!inputChar}
          >
            确定
          </button>
        </div>
        
        <div className="divider">
          <span>或者选择推荐</span>
        </div>
        
        <div className="recommended-chars">
          {displayedChars.map((char) => (
            <button
              key={char}
              className="char-btn"
              onClick={() => handleSelectRecommended(char)}
            >
              {char}
            </button>
          ))}
        </div>
        
        <button className="refresh-btn" onClick={refreshRecommendedChars}>
          换一批
        </button>
        
        {onCancel && (
          <button className="cancel-btn" onClick={onCancel}>
            取消
          </button>
        )}
      </div>

      <style jsx>{`
        .character-selector-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .character-selector {
          background-color: #F7F4ED;
          border-radius: 8px;
          padding: 30px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          position: relative;
          border: 1px solid #B0ABA9;
        }
        
        h2 {
          text-align: center;
          color: #1D1E20;
          margin-top: 0;
          margin-bottom: 20px;
          font-weight: bold;
          font-size: 24px;
        }
        
        .input-section {
          display: flex;
          margin-bottom: 20px;
        }
        
        input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #B0ABA9;
          border-radius: 4px;
          font-size: 18px;
          background-color: #F7F4ED;
          color: #1D1E20;
          margin-right: 10px;
          font-family: "Source Han Serif", serif;
        }
        
        .submit-btn {
          padding: 12px 20px;
          background-color: #C14C3A;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-family: "Source Han Serif", serif;
        }
        
        .submit-btn:disabled {
          background-color: #B0ABA9;
          cursor: not-allowed;
        }
        
        .divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: #B0ABA9;
        }
        
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid #B0ABA9;
        }
        
        .divider span {
          padding: 0 10px;
          font-size: 14px;
        }
        
        .recommended-chars {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .char-btn {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #7AACB7;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 36px;
          font-family: "Source Han Serif", serif;
          transition: transform 0.2s;
        }
        
        .char-btn:hover {
          transform: scale(1.05);
          background-color: #6A9BA6;
        }
        
        .refresh-btn {
          display: block;
          margin: 0 auto;
          padding: 10px 20px;
          background-color: transparent;
          color: #789262;
          border: 1px solid #789262;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-family: "Source Han Serif", serif;
        }
        
        .cancel-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          color: #B0ABA9;
          cursor: pointer;
          font-size: 14px;
        }
        
        @media (max-width: 480px) {
          .char-btn {
            width: 60px;
            height: 60px;
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}