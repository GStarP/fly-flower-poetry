/**
 * 数据管理模块测试页面
 * 用于在浏览器中展示和运行测试组件
 */

import React from "react";
import ModuleDataTest from "./ModuleDataTest";

const TestPage: React.FC = () => {
  return (
    <div className="test-page">
      <main>
        <ModuleDataTest />
      </main>

      <footer>
        <p>请打开浏览器控制台查看详细测试日志</p>
      </footer>

      <style jsx>{`
        .test-page {
          font-family: "Microsoft YaHei", Arial, sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 20px;
        }

        h1 {
          color: #333;
          font-size: 24px;
        }

        main {
          margin-bottom: 40px;
        }

        footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eaeaea;
        }
      `}</style>
    </div>
  );
};

export default TestPage;
