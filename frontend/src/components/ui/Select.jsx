export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Selecciona una opción',
  required = false,
  disabled = false
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-heading)] mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        className="input cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}