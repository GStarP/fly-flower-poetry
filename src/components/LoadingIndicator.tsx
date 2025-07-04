/**
 * 加载指示器组件
 * 用于显示加载状态，设计成水墨扩散或毛笔书写的动画效果
 */

interface LoadingIndicatorProps {
  message?: string; // 加载提示信息
}

/**
 * 加载指示器组件
 */
export default function LoadingIndicator({ message = '正在加载...' }: LoadingIndicatorProps) {
  return (
    <div className="loading-container">
      <div className="loading-indicator"></div>
      <p>{message}</p>
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #F7F4ED;
        }
        
        .loading-indicator {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(193, 76, 58, 0.3);
          border-radius: 50%;
          border-top-color: #C14C3A;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        p {
          color: #1D1E20;
          font-family: "Source Han Serif", serif;
        }
      `}</style>
    </div>
  );
}