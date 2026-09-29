import { useState } from "react";
import { ToastProvider } from "./components/ui/Toast";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileNav } from "./components/layout/MobileNav";
import { MoreSheet } from "./components/layout/MoreSheet";
import { TopBar } from "./components/layout/TopBar";
import { FirstLaunch } from "./pages/FirstLaunch";
import { Dashboard } from "./pages/Dashboard";
import { NewSale } from "./pages/NewSale";
import { Expenses } from "./pages/Expenses";
import { TodayHisaab } from "./pages/TodayHisaab";
import { Reports } from "./pages/Reports";
import { Items } from "./pages/Items";
import { Udhaar } from "./pages/Udhaar";
import { Settings } from "./pages/Settings";
import { PendingDaysModal } from "./components/PendingDaysModal";
import { Page } from "./types";

const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your cafe at a glance" },
  sale: { title: "New Sale", subtitle: "Tap items to build the bill" },
  expenses: { title: "Expenses", subtitle: "Record today's spending" },
  hisaab: { title: "Today's Hisaab", subtitle: "Complete daily summary" },
  udhaar: { title: "Udhaar", subtitle: "Customer credit records" },
  reports: { title: "Reports", subtitle: "Daily Excel & PDF reports" },
  items: { title: "Items", subtitle: "Manage products & prices" },
  settings: { title: "Settings", subtitle: "Cafe details, backup & more" },
};

function Shell() {
  const { data } = useApp();
  const [page, setPage] = useState<Page>("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);

  if (!data.settings.setupCompleted) {
    return <FirstLaunch />;
  }

  const meta = PAGE_META[page];

  return (
    <div className="flex min-h-screen bg-[#fbf7f2]">
      <Sidebar current={page} onNavigate={setPage} cafeName={data.settings.cafeName} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar title={meta.title} subtitle={meta.subtitle} cafeName={data.settings.cafeName} />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pb-8 lg:pb-8">
          {page === "dashboard" && <Dashboard onNavigate={setPage} />}
          {page === "sale" && <NewSale />}
          {page === "expenses" && <Expenses />}
          {page === "hisaab" && <TodayHisaab />}
          {page === "udhaar" && <Udhaar />}
          {page === "reports" && <Reports />}
          {page === "items" && <Items />}
          {page === "settings" && <Settings />}
        </main>
      </div>
      <MobileNav current={page} onNavigate={setPage} onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} onNavigate={setPage} />
      <PendingDaysModal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ToastProvider>
  );
}
