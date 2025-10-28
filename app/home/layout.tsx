export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return(
    <div className="flex">
        <div className="w-full px-4 md:px-8 lg:px-16 py-6 max-w-7xl m-auto">
            {children}
        </div>
    </div>
  );
}
