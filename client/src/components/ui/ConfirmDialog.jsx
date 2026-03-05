export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50"
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-scale-in">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {message && <p className="text-sm text-gray-500">{message}</p>}
        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 hover:scale-[1.02] hover:shadow-md">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`${danger ? 'btn-danger' : 'btn-primary'} flex-1 py-2.5 hover:scale-[1.02] hover:shadow-md`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
