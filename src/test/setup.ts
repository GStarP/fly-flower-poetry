import "@testing-library/jest-dom";
import { vi } from "vitest";

// 全局模拟计时器
global.jest = {
  useFakeTimers: () => {
    vi.useFakeTimers();
  },
  advanceTimersByTime: (ms: number) => {
    vi.advanceTimersByTime(ms);
  },
  clearAllMocks: () => {
    vi.clearAllMocks();
  },
  fn: vi.fn,
};

// 模拟 NodeJS.Timeout
declare global {
  var jest: {
    useFakeTimers: () => void;
    advanceTimersByTime: (ms: number) => void;
    clearAllMocks: () => void;
    fn: typeof vi.fn;
  };
}
