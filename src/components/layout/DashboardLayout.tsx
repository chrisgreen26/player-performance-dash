export function DashboardLayout({
  filters,
  panels,
  charts,
}: {
  filters: React.ReactNode;
  panels: React.ReactNode;
  charts: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto max-w-7xl px-4 py-3">{filters}</div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="flex min-w-0 flex-col gap-6">{panels}</div>
          <div className="flex min-w-0 flex-col gap-6">{charts}</div>
        </div>
      </div>
    </div>
  );
}
