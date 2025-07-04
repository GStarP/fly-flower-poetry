/**
 * Toast提示组件
 */

import { useEffect, useState } from 'react';
import { SuccessIcon, ErrorIcon, WarningIcon, InfoIcon } from './icons/ToastIcons';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // 显示时长（毫秒）
}

/**
 * Toast提示组件
 */
export default function ToastNotification({
  type,
  message,
  duration = 3000,
}: ToastProps) {
  const [visible, setVisible] = useState<boolean>(true);

  // 自动隐藏
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // 获取图标
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <div className={`toast-notification ${type}`}>
      <div className="icon">{getIcon()}</div>
      <div className="message">{message}</div>

      <style jsx>{`
        .toast-notification {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          animation: slideDown 0.3s ease-out, fadeOut 0.3s ease-out ${duration - 300}ms forwards;
          max-width: 90%;
          background-color: #F7F4ED;
          border: 1px solid;
        }
        
        .toast-notification.success {
          border-color: #789262;
        }
        
        .toast-notification.error {
          border-color: #C14C3A;
        }
        
        .toast-notification.warning {
          border-color: #E9B949;
        }
        
        .toast-notification.info {
          border-color: #7AACB7;
        }
        
        .icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .success .icon {
          color: #789262;
        }
        
        .error .icon {
          color: #C14C3A;
        }
        
        .warning .icon {
          color: #E9B949;
        }
        
        .info .icon {
          color: #7AACB7;
        }
        
        .message {
          color: #1D1E20;
          font-size: 14px;
        }
        
        @keyframes slideDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}