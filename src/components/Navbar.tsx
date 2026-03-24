import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Briefcase, MessageSquare, Bookmark, User, LayoutDashboard, PlusCircle, LogOut, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/trustbee-logo.png";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isEmployer, logout } = useAuth();

  const seekerLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/jobs", label: "Jobs", icon: Briefcase },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/saved", label: "Saved", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const employerLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/manage-jobs", label: "My Jobs", icon: ClipboardList },
    { to: "/create-job", label: "Post Job", icon: PlusCircle },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const navLinks = isEmployer ? employerLinks : seekerLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="TrustBee" className="h-11 w-11 rounded-lg" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Trust<span className="text-accent">Bee</span>
          </span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button variant={location.pathname === to ? "secondary" : "ghost"} size="sm" className="gap-1.5">
                  <Icon className="h-4 w-4" />{label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:block">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden gap-1.5 md:flex">
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:block">
                <Button variant="outline" size="sm">Log in</Button>
              </Link>
              <Link to="/register" className="hidden md:block">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Sign up</Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
                    <Button variant={location.pathname === to ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                      <Icon className="h-4 w-4" />{label}
                    </Button>
                  </Link>
                ))}
                <Button variant="outline" className="mt-2 w-full justify-start gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Log out
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
