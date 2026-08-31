import { Navigate, Route, Routes } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import CustomersPage from "./pages/CustomersPage.jsx";
import CustomerFormPage from "./pages/CustomerFormPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Hotel Booking</h1>
        <NavigationBar />
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<CustomerFormPage />} />
          <Route path="/customers/:customerId/edit" element={<CustomerFormPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
