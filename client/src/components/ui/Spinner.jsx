const SIZES = {
  sm: 'w-6 h-6 border-[3px]',
  md: 'w-8 h-8 border-4',
  lg: 'w-10 h-10 border-4',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`${SIZES[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin ${className}`}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
