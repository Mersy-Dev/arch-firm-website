import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CursorGlow from "@/components/ui/CursorGlow";

export default function PageWrapper() {
  const { pathname } = useLocation();
  return (
    <>
      <CursorGlow>
        {" "}
        {/* ← outside all pages */}
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, ease: "easeOut" },
            }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
            className="pt-[var(--nav-height)] min-h-screen"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Footer />
      </CursorGlow>
    </>
  );
}
