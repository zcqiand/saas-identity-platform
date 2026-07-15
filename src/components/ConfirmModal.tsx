import { type ReactNode } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  loadingText?: string;
  danger?: boolean;
}

/** 通用确认弹窗：删除/发布等二次确认 */
export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "确认",
  cancelText = "取消",
  loading = false,
  loadingText = "处理中...",
  danger = true,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-[90vw]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <div className="text-gray-600 text-sm">{message}</div>
        </div>
        <div className="px-6 py-3 flex justify-end gap-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded text-white disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
