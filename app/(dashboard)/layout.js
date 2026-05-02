import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  return (
    <>
      <Header />
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {children}
      </div>
    </>
  );
}
