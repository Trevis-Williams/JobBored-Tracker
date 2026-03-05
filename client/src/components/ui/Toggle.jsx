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
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
            checked ? 'left-[26px]' : 'left-[3px]'
          }`}
        />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </button>
  );
}
