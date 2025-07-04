/**
 * 诗句输入组件
 */

import { useState, useRef, useEffect } from "react";

interface PoetryInputProps {
  onSubmit: (content: string) => void;
  limitChar: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * 诗句输入组件
 */
export default function PoetryInput({
  onSubmit,
  limitChar,
  disabled = false,
  placeholder = "请输入包含限定字的诗句...",
}: PoetryInputProps) {
  const [input, setInput] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当组件挂载时，聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 验证输入是否包含限定字
  useEffect(() => {
    if (input !== "") {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [input, limitChar]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isValid && !disabled) {
      onSubmit(input);
      setInput("");
    }
  };

  return (
    <form className="poetry-input" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={isValid ? "valid" : ""}
      />
      <button type="submit" disabled={!isValid || disabled}>
        发送
      </button>

      <style jsx>{`
        .poetry-input {
          display: flex;
          width: 100%;
        }

        input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #b0aba9;
          border-radius: 4px 0 0 4px;
          font-size: 16px;
          background-color: #f7f4ed;
          color: #1d1e20;
          font-family: "Source Han Serif", serif;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #7aacb7;
          box-shadow: 0 0 0 2px rgba(122, 172, 183, 0.2);
        }

        input.valid {
          border-color: #789262;
          box-shadow: 0 0 0 2px rgba(120, 146, 98, 0.2);
        }



        button {
          padding: 12px 24px;
          background-color: #c14c3a;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          font-size: 16px;
          font-family: "Source Han Serif", serif;
          transition: background-color 0.3s;
        }

        button:hover:not(:disabled) {
          background-color: #a43a2a;
        }

        button:disabled {
          background-color: #b0aba9;
          cursor: not-allowed;
        }
      `}</style>
    </form>
  );
}
