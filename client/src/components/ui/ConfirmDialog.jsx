export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-backdrop" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-scale-in">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {message && <p className="text-sm text-gray-500">{message}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-colors ${
              danger
                ? 'bg-danger-500 text-white hover:bg-danger-600'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
