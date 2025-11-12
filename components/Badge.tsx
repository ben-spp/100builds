interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'default';
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    default: 'bg-surface-2 text-text-secondary border-border',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
}
