import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="page">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            Searchly API Explorer
          </p>

          <span>
            Search • Filter • Sort • Discover
          </span>
        </div>
      </footer>
    </div>
  );
}