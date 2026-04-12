import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="lg:ml-64 p-4 pt-16 lg:pt-8 lg:p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
