export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  hint,
  error,
  step,
  min
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none"
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          step={step}
          min={min}
          className={`input ${Icon ? 'pl-9' : ''} ${error ? 'border-red-300' : ''}`}
        />
      </div>
      {hint && !error && <p className="text-xs text-[var(--color-muted)] mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}