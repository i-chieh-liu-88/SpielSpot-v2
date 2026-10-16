
import { Outlet } from "@tanstack/react-router";
import { Footer } from "../../components/organisms/Footer/Footer";
import { Navbar } from "../../components/organisms/Navbar/Navbar";

export function MainLayout() {

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
