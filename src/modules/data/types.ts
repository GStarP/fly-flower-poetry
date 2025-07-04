/**
 * 数据管理模块类型定义
 */

// 诗句接口
export interface Sentence {
  id: number;
  content: string;
  poetryId: number;
  poetryIndex: number;
}

// 诗词接口
export interface Poetry {
  id: number;
  author: string;
  title: string;
  paragraphs: string[]; // 包含诗词的所有句子内容
}