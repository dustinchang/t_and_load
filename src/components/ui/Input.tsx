import { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const inputClass = ['input', error ? 'input--error' : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="input-group">
        {label && (
          <label className="input-label" htmlFor={inputId}>
            {label}
          </label>
        )}
        {icon ? (
          <div className="input-icon-wrapper">
            <span className="input-icon">{icon}</span>
            <input ref={ref} id={inputId} className={inputClass} {...props} />
          </div>
        ) : (
          <input ref={ref} id={inputId} className={inputClass} {...props} />
        )}
        {error && <span className="input-error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
