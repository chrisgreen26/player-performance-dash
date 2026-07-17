export function DashboardLayout({
  controls,
  filtersPanel,
  children,
}: {
  controls: React.ReactNode;
  filtersPanel: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3">
          {controls}
          {filtersPanel}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">{children}</div>
    </div>
  );
}
