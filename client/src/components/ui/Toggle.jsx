export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <div
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </button>
  );
}
