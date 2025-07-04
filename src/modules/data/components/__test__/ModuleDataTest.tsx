/**
 * 数据管理模块测试组件
 * 用于在浏览器环境中测试数据管理模块的功能
 */

import React, { useState, useEffect } from "react";
import { useDatabase } from "../../hooks/useDatabase";

// 测试用例接口
interface TestCase {
  name: string;
  run: () => Promise<TestResult>;
}

// 测试结果接口
interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 数据管理模块测试组件
 */
const ModuleDataTest: React.FC = () => {
  // 使用数据库Hook
  const { loading, error, initialized, queryPoetrySentences, getPoetryById } =
    useDatabase();

  // 测试状态
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {}
  );
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [allTestsCompleted, setAllTestsCompleted] = useState<boolean>(false);

  // 定义测试用例
  const testCases: TestCase[] = [
    // 测试数据库初始化
    {
      name: "测试数据库初始化",
      run: async () => {
        console.log("📝 测试数据库初始化状态");
        console.log(
          `📊 当前状态: initialized=${initialized}, loading=${loading}, error=${
            error || "无"
          }`
        );

        if (initialized) {
          console.log("✅ 预期结果: 数据库初始化成功");
          return {
            success: true,
            message: "数据库初始化成功",
          };
        } else if (error) {
          console.log(`❌ 错误结果: 数据库初始化失败: ${error}`);
          return {
            success: false,
            message: `数据库初始化失败: ${error}`,
          };
        } else {
          console.log("⚠️ 未知结果: 数据库初始化状态未知");
          return {
            success: false,
            message: "数据库初始化状态未知",
          };
        }
      },
    },

    // 测试查询诗句功能
    {
      name: "测试查询诗句功能",
      run: async () => {
        try {
          // 使用常见汉字进行测试
          const testChar = "花";
          console.log(`📝 测试参数: 查询包含「${testChar}」的诗句`);

          const sentences = await queryPoetrySentences(testChar, [], 5);

          if (sentences.length > 0) {
            console.log("📋 查询结果:");
            sentences.forEach((s, index) =>
              console.log(
                `  ${index + 1}. ${s.content} (ID: ${s.id}, 诗词ID: ${
                  s.poetryId
                })`
              )
            );

            return {
              success: true,
              message: `成功查询到 ${sentences.length} 条包含「${testChar}」的诗句`,
              data: sentences,
            };
          } else {
            console.log("❗ 查询结果为空");
            return {
              success: false,
              message: `未找到包含「${testChar}」的诗句`,
            };
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "未知错误";
          console.error("❌ 查询出错:", errorMessage);
          return {
            success: false,
            message: `查询诗句失败: ${errorMessage}`,
          };
        }
      },
    },

    // 测试获取诗词详情功能
    {
      name: "测试获取诗词详情功能",
      run: async () => {
        try {
          // 先查询一条诗句，然后获取其诗词详情
          console.log("📝 步骤1: 查询一条包含「花」的诗句");
          const sentences = await queryPoetrySentences("花", [], 1);

          if (sentences.length === 0) {
            console.log("❗ 未找到测试用的诗句");
            return {
              success: false,
              message: "未找到测试用的诗句，无法测试获取诗词详情功能",
            };
          }

          const poetryId = sentences[0].poetryId;
          console.log(`📝 步骤2: 获取诗词详情，诗词ID: ${poetryId}`);

          const poetry = await getPoetryById(poetryId);

          console.log("📋 获取诗词详情结果:");
          console.log(`  📜 标题: ${poetry.title}`);
          console.log(`  ✍️ 作者: ${poetry.author}`);
          console.log("  📖 内容:");
          poetry.paragraphs.forEach((p, index) =>
            console.log(`    ${index + 1}. ${p}`)
          );

          return {
            success: true,
            message: `成功获取诗词《${poetry.title}》的详情`,
            data: poetry,
          };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "未知错误";
          console.error("❌ 获取诗词详情出错:", errorMessage);
          return {
            success: false,
            message: `获取诗词详情失败: ${errorMessage}`,
          };
        }
      },
    },

    // 测试边界情况：查询不存在的字符
    {
      name: "测试查询不存在的字符",
      run: async () => {
        try {
          // 使用一个不太可能在古诗中出现的字符组合
          const testChar = "xyz123";
          console.log(
            `📝 测试参数: 查询包含「${testChar}」的诗句 (预期不存在)`
          );

          const sentences = await queryPoetrySentences(testChar, [], 5);

          if (sentences.length === 0) {
            console.log("✅ 预期结果: 返回空数组");
            return {
              success: true,
              message: `正确处理了不存在的字符「${testChar}」的查询，返回空数组`,
            };
          } else {
            console.log("❌ 意外结果: 查询到了结果");
            console.log("📋 意外查询结果:");
            sentences.forEach((s, index) =>
              console.log(`  ${index + 1}. ${s.content}`)
            );
            return {
              success: false,
              message: `意外查询到包含「${testChar}」的诗句，这可能是一个错误`,
              data: sentences,
            };
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "未知错误";
          console.error("❌ 测试出错:", errorMessage);
          return {
            success: false,
            message: `测试查询不存在的字符时发生错误: ${errorMessage}`,
          };
        }
      },
    },

    // 测试边界情况：获取不存在的诗词ID
    {
      name: "测试获取不存在的诗词ID",
      run: async () => {
        try {
          // 使用一个不太可能存在的诗词ID
          const invalidPoetryId = 999999;
          console.log(
            `📝 测试参数: 获取不存在的诗词ID: ${invalidPoetryId} (预期抛出异常)`
          );

          await getPoetryById(invalidPoetryId);

          // 如果没有抛出异常，说明测试失败
          console.log("❌ 意外结果: 没有抛出异常");
          return {
            success: false,
            message: `获取不存在的诗词ID没有抛出异常，这可能是一个错误`,
          };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "未知错误";
          console.log(`✅ 预期结果: 正确抛出异常: ${errorMessage}`);

          // 检查错误消息是否符合预期
          if (err instanceof Error && err.message.includes("未找到ID")) {
            console.log("✅ 异常消息符合预期");
            return {
              success: true,
              message: `正确处理了不存在的诗词ID的请求，抛出了预期的异常: ${errorMessage}`,
            };
          } else {
            console.log("⚠️ 异常消息不符合预期");
            return {
              success: false,
              message: `获取不存在的诗词ID抛出了异常，但错误消息不符合预期: ${errorMessage}`,
            };
          }
        }
      },
    },
  ];

  // 打印带分隔符的日志
  const logWithSeparator = (
    message: string,
    type: "info" | "success" | "error" | "warning" = "info"
  ) => {
    const getStyle = () => {
      switch (type) {
        case "success":
          return "color: green; font-weight: bold;";
        case "error":
          return "color: red; font-weight: bold;";
        case "warning":
          return "color: orange; font-weight: bold;";
        default:
          return "color: blue; font-weight: bold;";
      }
    };

    console.log("%c" + "=".repeat(50), getStyle());
    console.log(message);
    console.log("%c" + "=".repeat(50), getStyle());
  };

  // 运行所有测试用例
  useEffect(() => {
    const runTests = async () => {
      // 等待数据库初始化完成
      if (loading) {
        return;
      }

      logWithSeparator("📊 开始运行数据管理模块测试...", "info");

      // 依次运行每个测试用例
      for (const testCase of testCases) {
        setRunningTest(testCase.name);

        // 打印测试用例开始信息
        logWithSeparator(`🔍 开始测试: ${testCase.name}`, "info");

        // 运行测试用例
        const result = await testCase.run();

        // 打印测试用例结果
        const resultIcon = result.success ? "✅" : "❌";
        const resultType = result.success ? "success" : "error";
        logWithSeparator(
          `${resultIcon} 测试结果: ${result.success ? "成功" : "失败"} - ${
            result.message
          }`,
          resultType
        );

        // 更新状态
        setTestResults((prev) => ({
          ...prev,
          [testCase.name]: result,
        }));
      }

      setRunningTest(null);
      setAllTestsCompleted(true);
      logWithSeparator("🎉 所有测试完成", "success");
    };

    runTests();
  }, [loading]);

  // 渲染测试结果
  return (
    <div className="module-data-test">
      {loading ? (
        <p>数据库初始化中，请稍候...</p>
      ) : (
        <div>
          <div className="test-status">
            <p>
              <strong>数据库状态:</strong>{" "}
              {initialized ? "已初始化" : "未初始化"}
              {error && <span className="error"> - 错误: {error}</span>}
            </p>
            {runningTest && (
              <p>
                <strong>正在运行:</strong> {runningTest}
              </p>
            )}
            {allTestsCompleted && (
              <p className="completed">
                所有测试已完成，请查看控制台获取详细日志
              </p>
            )}
          </div>

          <div className="test-results">
            <h3>测试结果:</h3>
            <ul>
              {testCases.map((testCase) => {
                const result = testResults[testCase.name];
                return (
                  <li key={testCase.name}>
                    <strong>{testCase.name}:</strong>
                    {result ? (
                      <span className={result.success ? "success" : "failure"}>
                        {result.success ? "✓ 成功" : "✗ 失败"} -{" "}
                        {result.message}
                      </span>
                    ) : (
                      <span className="pending">等待中...</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <style jsx>{`
        .module-data-test {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h2 {
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }

        .test-status {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f0f0f0;
          border-radius: 4px;
        }

        .test-results ul {
          list-style-type: none;
          padding: 0;
        }

        .test-results li {
          margin-bottom: 10px;
          padding: 10px;
          background-color: #fff;
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .success {
          color: green;
        }

        .failure {
          color: red;
        }

        .pending {
          color: #888;
        }

        .error {
          color: red;
        }

        .completed {
          color: green;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default ModuleDataTest;
