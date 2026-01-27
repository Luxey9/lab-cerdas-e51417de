import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Beranda from "./pages/Beranda";
import UploadLaporan from "./pages/UploadLaporan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect to beranda if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/beranda" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/beranda"
        element={
          <ProtectedRoute>
            <Beranda />
          </ProtectedRoute>
        }
      />

      {/* Praktikan Routes */}
      <Route
        path="/upload-laporan"
        element={
          <ProtectedRoute allowedRoles={["praktikan"]}>
            <UploadLaporan />
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for other pages */}
      <Route
        path="/absensi"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Absensi" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jadwal"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Jadwal Saya" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modul"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Unduh Modul" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/input-nilai"
        element={
          <ProtectedRoute allowedRoles={["asisten", "koordinator"]}>
            <PlaceholderPage title="Input Nilai" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/validasi-absensi"
        element={
          <ProtectedRoute allowedRoles={["asisten", "koordinator"]}>
            <PlaceholderPage title="Validasi Absensi" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jadwal-jaga"
        element={
          <ProtectedRoute allowedRoles={["asisten", "koordinator"]}>
            <PlaceholderPage title="Jadwal Jaga" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventaris"
        element={
          <ProtectedRoute allowedRoles={["asisten", "koordinator"]}>
            <PlaceholderPage title="Inventaris" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manajemen-user"
        element={
          <ProtectedRoute allowedRoles={["koordinator"]}>
            <PlaceholderPage title="Manajemen User" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laporan-keuangan"
        element={
          <ProtectedRoute allowedRoles={["koordinator"]}>
            <PlaceholderPage title="Laporan Keuangan" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approval-jadwal"
        element={
          <ProtectedRoute allowedRoles={["koordinator"]}>
            <PlaceholderPage title="Approval Jadwal" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pengaturan"
        element={
          <ProtectedRoute allowedRoles={["koordinator"]}>
            <PlaceholderPage title="Pengaturan" />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Placeholder component for pages not yet implemented
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center card-elevated">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <Construction className="w-8 h-8 text-warning" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Halaman ini sedang dalam pengembangan dan akan segera tersedia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Silakan kembali lagi nanti atau hubungi administrator untuk informasi lebih lanjut.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
