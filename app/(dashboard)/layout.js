import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      <main>{children}</main>

    </div>
  );
}
