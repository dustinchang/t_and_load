import './Spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner--${size}`} />
      {label && <span>{label}</span>}
    </div>
  );
}
