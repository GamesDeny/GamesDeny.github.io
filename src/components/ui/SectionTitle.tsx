interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: Readonly<SectionTitleProps>) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-mono font-bold">
        <span className="text-accent">## </span>
        <span className="text-text-primary">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-2 text-muted font-mono text-sm">{subtitle}</p>
      )}
      <div className="mt-4 h-px w-16 bg-accent/40" />
    </div>
  );
}
