export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 opacity-100 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all animate-scale-in">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="border-t px-4 py-2 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
