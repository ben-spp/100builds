interface CategorySelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export default function CategorySelector({ label, value, onChange, options }: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-text-secondary">
        {label} <span className="text-primary">*</span>
      </label>

      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              px-4 py-4 rounded-xl font-semibold text-sm transition-all
              ${
                value === option
                  ? 'bg-primary text-white border-2 border-primary shadow-lg scale-105'
                  : 'bg-surface-1 text-text-secondary border-2 border-border hover:border-primary/50 hover:bg-surface-2'
              }
            `}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {!value && (
        <p className="text-xs text-text-muted">Select a category to continue</p>
      )}
    </div>
  );
}
