import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Attendance {
  id: string;
  attendance_date: string;
  check_in_time: string | null;
  status: "hadir" | "izin" | "alpha";
  schedule_id: string;
}

export default function Absensi() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAttendances();
    }
  }, [user]);

  const fetchAttendances = async () => {
    try {
      const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", user?.id)
        .order("attendance_date", { ascending: false })
        .limit(20);

      if (error) throw error;
      setAttendances(data || []);
    } catch (err) {
      console.error("Error fetching attendances:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = async () => {
    setScanning(true);
    // Simulasi scan QR - pada implementasi nyata akan menggunakan camera
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Fitur QR Scanner",
      description: "Scanner QR memerlukan integrasi kamera perangkat. Hubungi administrator untuk aktivasi.",
    });
    setScanning(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hadir":
        return <Badge className="bg-success/10 text-success border-success/20">Hadir</Badge>;
      case "izin":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Izin</Badge>;
      case "alpha":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Alpha</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hadir":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "izin":
        return <Clock className="w-5 h-5 text-warning" />;
      case "alpha":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate statistics
  const stats = {
    total: attendances.length,
    hadir: attendances.filter(a => a.status === "hadir").length,
    izin: attendances.filter(a => a.status === "izin").length,
    alpha: attendances.filter(a => a.status === "alpha").length,
  };

  const attendancePercentage = stats.total > 0 
    ? Math.round((stats.hadir / stats.total) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Absensi</h1>
          <p className="text-muted-foreground mt-1">
            Scan QR Code untuk mencatat kehadiran Anda
          </p>
        </div>

        {/* QR Scanner Card */}
        <Card className="card-elevated">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="w-6 h-6" />
              Scan QR Absensi
            </CardTitle>
            <CardDescription>
              Arahkan kamera ke QR Code yang ditampilkan oleh asisten
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center bg-muted/30">
              {scanning ? (
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              ) : (
                <QrCode className="w-16 h-16 text-muted-foreground/50" />
              )}
            </div>
            <Button 
              size="lg" 
              onClick={handleScanQR}
              disabled={scanning}
              className="w-full max-w-xs"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memindai...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Mulai Scan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{attendancePercentage}%</div>
                <p className="text-sm text-muted-foreground mt-1">Kehadiran</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{stats.hadir}</div>
                <p className="text-sm text-muted-foreground mt-1">Hadir</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">{stats.izin}</div>
                <p className="text-sm text-muted-foreground mt-1">Izin</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">{stats.alpha}</div>
                <p className="text-sm text-muted-foreground mt-1">Alpha</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Riwayat Absensi</CardTitle>
            <CardDescription>
              Daftar kehadiran Anda pada setiap sesi praktikum
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : attendances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada data absensi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendances.map((attendance) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(attendance.status)}
                      <div>
                        <p className="font-medium text-foreground">
                          {formatDate(attendance.attendance_date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Check-in: {formatTime(attendance.check_in_time)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(attendance.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
