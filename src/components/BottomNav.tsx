import { NavLink } from "react-router-dom";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Tab to="/" label="New Order" icon="＋" end />
      <Tab to="/orders" label="My Orders" icon="≡" />
    </nav>
  );
}

function Tab({ to, label, icon, end }: { to: string; label: string; icon: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-2.5 text-xs ${
          isActive ? "text-primary font-semibold" : "text-muted-foreground"
        }`
      }
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}