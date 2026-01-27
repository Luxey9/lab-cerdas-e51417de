import { ReactNode, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FlaskConical,
  Home,
  Calendar,
  FileText,
  Upload,
  QrCode,
  ClipboardCheck,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const praktikanMenu: NavItem[] = [
  { label: "Beranda", href: "/beranda", icon: <Home className="w-5 h-5" /> },
  { label: "Absensi", href: "/absensi", icon: <QrCode className="w-5 h-5" /> },
  { label: "Jadwal Saya", href: "/jadwal", icon: <Calendar className="w-5 h-5" /> },
  { label: "Unduh Modul", href: "/modul", icon: <FileText className="w-5 h-5" /> },
  { label: "Upload Laporan", href: "/upload-laporan", icon: <Upload className="w-5 h-5" /> },
];

const asistenMenu: NavItem[] = [
  { label: "Beranda", href: "/beranda", icon: <Home className="w-5 h-5" /> },
  { label: "Input Nilai", href: "/input-nilai", icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: "Validasi Absensi", href: "/validasi-absensi", icon: <QrCode className="w-5 h-5" /> },
  { label: "Jadwal Jaga", href: "/jadwal-jaga", icon: <Calendar className="w-5 h-5" /> },
  { label: "Inventaris", href: "/inventaris", icon: <Package className="w-5 h-5" /> },
];

const koordinatorMenu: NavItem[] = [
  { label: "Beranda", href: "/beranda", icon: <Home className="w-5 h-5" /> },
  { label: "Manajemen User", href: "/manajemen-user", icon: <Users className="w-5 h-5" /> },
  { label: "Laporan Keuangan", href: "/laporan-keuangan", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Approval Jadwal", href: "/approval-jadwal", icon: <Calendar className="w-5 h-5" /> },
  { label: "Inventaris", href: "/inventaris", icon: <Package className="w-5 h-5" /> },
  { label: "Pengaturan", href: "/pengaturan", icon: <Settings className="w-5 h-5" /> },
];

function getMenuByRole(role: string | null): NavItem[] {
  switch (role) {
    case "praktikan":
      return praktikanMenu;
    case "asisten":
      return asistenMenu;
    case "koordinator":
      return koordinatorMenu;
    default:
      return praktikanMenu;
  }
}

function getRoleLabel(role: string | null): string {
  switch (role) {
    case "praktikan":
      return "Praktikan";
    case "asisten":
      return "Asisten";
    case "koordinator":
      return "Koordinator";
    default:
      return "Pengguna";
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = getMenuByRole(role);
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-foreground truncate">
              Lab Algoritma
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Sistem Manajemen
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <span className={cn(isActive && "text-sidebar-primary")}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto text-sidebar-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-9 h-9 bg-sidebar-accent">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {getRoleLabel(role)}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
