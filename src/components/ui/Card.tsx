import './Card.css';

interface CardProps {
  children: React.ReactNode;
  padded?: boolean;
  compact?: boolean;
  clickable?: boolean;
  elevated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  padded = false,
  compact = false,
  clickable = false,
  elevated = false,
  className = '',
  onClick,
}: CardProps) {
  const classes = [
    'card',
    padded ? 'card--padded' : '',
    compact ? 'card--compact' : '',
    clickable ? 'card--clickable' : '',
    elevated ? 'card--elevated' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
