interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'textarea' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = false,
}: FormFieldProps) {
  const baseClasses = error
    ? 'w-full px-4 py-3 bg-surface-1 border-2 border-red-500 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all'
    : 'w-full px-4 py-3 bg-surface-1 border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all';

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-text-secondary">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={baseClasses}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={baseClasses}
        />
      )}
    </div>
  );
}
