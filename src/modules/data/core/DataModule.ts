/**
 * 数据管理模块
 * 负责加载、管理和查询诗词数据库
 */

import type { Sentence, Poetry } from "../types";
import initSqlJs, { type Database } from "sql.js";

/**
 * 数据管理模块接口
 */
export interface DataModuleInterface {
  // 初始化数据库
  initDatabase(): Promise<boolean>;

  // 根据部分内容匹配诗句
  queryPoetrySentences(
    partialContent: string,
    excludeIds?: number[],
    limit?: number
  ): Promise<Sentence[]>;

  // 根据诗词ID获取诗词详细信息
  getPoetryById(poetryId: number): Promise<Poetry>;
}

/**
 * 数据管理模块实现类
 */
export class DataModule implements DataModuleInterface {
  private db: Database | null = null;
  private initialized = false;
  private dbUrl = "/data/poetry.db"; // 数据库文件路径

  /**
   * 初始化数据库
   * @returns 初始化是否成功
   */
  public async initDatabase(): Promise<boolean> {
    try {
      // 初始化SQL.js
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // 加载数据库文件
      const response = await fetch(this.dbUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uInt8Array = new Uint8Array(arrayBuffer);

      // 创建数据库实例
      this.db = new SQL.Database(uInt8Array);
      this.initialized = true;

      console.log("数据库初始化成功");
      return true;
    } catch (error) {
      console.error("数据库初始化失败:", error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * 根据部分内容匹配诗句
   * @param partialContent 包含的字符
   * @param excludeIds 排除的诗句ID列表
   * @param limit 返回结果数量限制
   * @returns 匹配的诗句列表
   */
  public async queryPoetrySentences(
    partialContent: string,
    excludeIds: number[] = [],
    limit: number = 10
  ): Promise<Sentence[]> {
    if (!this.initialized || !this.db) {
      throw new Error("数据库未初始化");
    }

    try {
      // 记录查询开始时间
      const startTime = performance.now();

      // 构建排除ID的SQL片段
      const excludeClause =
        excludeIds.length > 0
          ? `AND sentence_id NOT IN (${excludeIds.join(",")})`
          : "";

      // 查询包含指定字符的诗句
      const query = `
        SELECT sentence_id, poetry_id, poetry_index, content 
        FROM sentence 
        WHERE content LIKE '%${partialContent}%' ${excludeClause}
        ORDER BY RANDOM()
        LIMIT ${limit}
      `;

      console.group('查询匹配诗句')
      console.log(`查询条件：content=${partialContent}, excludeIds=${excludeIds}, limit=${limit}`);

      const results = this.db.exec(query);

      // 记录查询结束时间并计算用时
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      console.log(`查询用时: ${executionTime.toFixed(2)}ms`);

      if (results.length === 0 || results[0].values.length === 0) {
        console.log("查询结果：无");
        return [];
      }

      // 转换查询结果为Sentence对象数组
      const sentences = results[0].values.map((row) => ({
        id: row[0] as number,
        poetryId: row[1] as number,
        poetryIndex: row[2] as number,
        content: row[3] as string,
      }));
      console.log("查询结果:", sentences);

      return sentences;
    } catch (error) {
      console.error("查询失败:", error);
      return [];
    } finally {
      console.groupEnd()
    }
  }

  /**
   * 根据诗词ID获取诗词详细信息
   * @param poetryId 诗词ID
   * @returns 诗词详细信息
   */
  public async getPoetryById(poetryId: number): Promise<Poetry> {
    if (!this.initialized || !this.db) {
      throw new Error("数据库未初始化");
    }

    try {
      // 查询诗词基本信息
      const poetryQuery = `
        SELECT poetry_id, author, title 
        FROM poetry 
        WHERE poetry_id = ${poetryId}
      `;

      const poetryResults = this.db.exec(poetryQuery);

      if (poetryResults.length === 0 || poetryResults[0].values.length === 0) {
        throw new Error(`未找到ID为${poetryId}的诗词`);
      }

      const poetryRow = poetryResults[0].values[0];

      // 查询诗词的所有句子
      const sentencesQuery = `
        SELECT content 
        FROM sentence 
        WHERE poetry_id = ${poetryId} 
        ORDER BY poetry_index
      `;

      const sentencesResults = this.db.exec(sentencesQuery);
      const paragraphs = sentencesResults[0].values.map(
        (row) => row[0] as string
      );

      // 构建并返回Poetry对象
      return {
        id: poetryRow[0] as number,
        author: poetryRow[1] as string,
        title: poetryRow[2] as string,
        paragraphs,
      };
    } catch (error) {
      console.error("获取诗词详情失败:", error);
      throw error;
    }
  }
}

// 导出数据管理模块单例
export const dataModule = new DataModule();
