type IntakeSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function IntakeSection({
  title,
  description,
  children,
}: IntakeSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
