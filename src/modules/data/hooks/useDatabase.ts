/**
 * 数据库Hook
 * 提供在React组件中使用数据管理模块的能力
 */

import { useState, useEffect, useCallback } from "react";
import { dataModule } from "../core/DataModule";
import type { Sentence, Poetry } from "../types";

/**
 * 数据库Hook返回值接口
 */
interface UseDatabaseResult {
  loading: boolean;
  error: string | null;
  initialized: boolean;
  queryPoetrySentences: (
    partialContent: string,
    excludeIds?: number[],
    limit?: number
  ) => Promise<Sentence[]>;
  getPoetryById: (poetryId: number) => Promise<Poetry>;
}

/**
 * 数据库Hook
 * @returns 数据库操作相关状态和方法
 */
export function useDatabase(): UseDatabaseResult {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // 初始化数据库
  useEffect(() => {
    const initDb = async () => {
      try {
        setLoading(true);
        setError(null);

        const success = await dataModule.initDatabase();

        if (success) {
          setInitialized(true);
        } else {
          setError("数据库初始化失败");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "数据库初始化过程中发生未知错误"
        );
      } finally {
        setLoading(false);
      }
    };

    initDb();
  }, []);

  // 查询诗句的包装方法
  const queryPoetrySentences = useCallback(
    async (
      partialContent: string,
      excludeIds?: number[],
      limit?: number
    ): Promise<Sentence[]> => {
      if (!initialized) {
        throw new Error("数据库未初始化");
      }

      try {
        return await dataModule.queryPoetrySentences(
          partialContent,
          excludeIds,
          limit
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "查询诗句失败");
        return [];
      }
    },
    [initialized]
  );

  // 获取诗词详情的包装方法
  const getPoetryById = useCallback(
    async (poetryId: number): Promise<Poetry> => {
      if (!initialized) {
        throw new Error("数据库未初始化");
      }

      try {
        return await dataModule.getPoetryById(poetryId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取诗词详情失败");
        throw err;
      }
    },
    [initialized]
  );

  return {
    loading,
    error,
    initialized,
    queryPoetrySentences,
    getPoetryById,
  };
}