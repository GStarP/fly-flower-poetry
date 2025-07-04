import { useState, useEffect } from "react";
import { DataTestPage } from "./modules/data";
import GamePage from "./pages/GamePage";

function App() {
  const [showTest, setShowTest] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  
  // 检查URL参数，只在URL包含test=dataModule时显示开发工具
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const testParam = urlParams.get('test');
    setShowDevTools(testParam === 'dataModule');
  }, []);

  return (
    <div className="app">
      {showTest ? (
        <>
          <header>
            <h1>飞花令游戏 - 数据模块测试</h1>
            <button onClick={() => setShowTest(false)}>返回游戏</button>
          </header>
          <main className="test-main">
            <DataTestPage />
          </main>
        </>
      ) : (
        <>
          <div className="game-container">
            <GamePage />
          </div>
          {showDevTools && (
            <div className="dev-tools">
              <button onClick={() => setShowTest(true)}>数据模块测试</button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .app {
          font-family: "Source Han Serif", "Microsoft YaHei", Arial, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background-color: #f7f4ed;
          border-bottom: 1px solid rgba(176, 171, 169, 0.5);
        }

        h1 {
          margin: 0;
          color: #1d1e20;
        }

        button {
          padding: 8px 16px;
          background-color: #c14c3a;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-family: "Source Han Serif", serif;
        }

        button:hover {
          background-color: #a43a2a;
        }

        .test-main {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: #f7f4ed;
        }

        .game-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .dev-tools {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          opacity: 0.7;
          transition: opacity 0.3s;
        }

        .dev-tools:hover {
          opacity: 1;
        }

        .dev-tools button {
          background-color: #789262;
          font-size: 12px;
          padding: 6px 12px;
        }

        .dev-tools button:hover {
          background-color: #5a7049;
        }
      `}</style>
    </div>
  );
}

export default App;
