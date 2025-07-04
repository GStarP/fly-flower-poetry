/**
 * 数据管理模块入口
 * 导出所有公开内容
 */

// 导出类型定义
export type { Sentence, Poetry } from "./types";

// 导出核心模块
export {
  dataModule,
  DataModule,
  type DataModuleInterface,
} from "./core/DataModule";

// 导出Hooks
export { useDatabase } from "./hooks/useDatabase";

// 导出测试组件
export { default as ModuleDataTest } from "./components/__test__/ModuleDataTest";
export { default as DataTestPage } from "./components/__test__/TestPage";
