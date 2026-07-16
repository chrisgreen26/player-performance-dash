export function DashboardSection({
  panel,
  chart,
}: {
  panel: React.ReactNode;
  chart: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
      <div className="min-w-0">{panel}</div>
      <div className="min-w-0">{chart}</div>
    </section>
  );
}
