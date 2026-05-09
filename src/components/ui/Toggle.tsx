import './Toggle.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  subLabel?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, subLabel, id }: ToggleProps) {
  const toggleId = id ?? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="toggle-row">
      <div className="toggle-label">
        <label className="toggle-label-text" htmlFor={toggleId}>
          {label}
        </label>
        {subLabel && <span className="toggle-label-sub">{subLabel}</span>}
      </div>
      <label className="toggle">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-track" />
      </label>
    </div>
  );
}
