import { NavLink } from "react-router-dom";

const navigationLinks = [
  { path: "/customers", label: "Customers" },
  { path: "/rooms", label: "Rooms" },
  { path: "/bookings", label: "Bookings" }
];

export default function NavigationBar() {
  return (
    <nav className="navigation-bar">
      {navigationLinks.map((navigationLink) => (
        <NavLink
          key={navigationLink.path}
          to={navigationLink.path}
          className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
        >
          {navigationLink.label}
        </NavLink>
      ))}
    </nav>
  );
}
