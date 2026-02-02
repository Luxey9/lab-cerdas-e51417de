import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  course: {
    name: string;
    code: string;
  } | null;
}

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function Jadwal() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  const fetchSchedules = async () => {
    try {
      // Fetch all schedules with course info (for demo purposes)
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room,
          courses (
            name,
            code
          )
        `)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        course: item.courses as { name: string; code: string } | null
      }));
      
      setSchedules(transformedData);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Format HH:MM
  };

  const getTodaySchedules = () => {
    const today = new Date().getDay();
    return schedules.filter(s => s.day_of_week === today);
  };

  const getUpcomingSchedules = () => {
    const today = new Date().getDay();
    return schedules.filter(s => s.day_of_week > today).slice(0, 3);
  };

  const todaySchedules = getTodaySchedules();
  const upcomingSchedules = getUpcomingSchedules();

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, Schedule[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jadwal Saya</h1>
          <p className="text-muted-foreground mt-1">
            Lihat jadwal praktikum Anda
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Today's Schedule */}
            <Card className="card-elevated border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Jadwal Hari Ini - {dayNames[new Date().getDay()]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaySchedules.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Tidak ada jadwal praktikum hari ini
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todaySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {schedule.course?.name || "Praktikum"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.course?.code}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                            <MapPin className="w-3 h-3" />
                            {schedule.room || "TBA"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Jadwal Mingguan</CardTitle>
                <CardDescription>
                  Semua jadwal praktikum dalam satu minggu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada jadwal yang tersedia</p>
                    <p className="text-sm mt-1">Jadwal akan ditampilkan setelah Anda terdaftar pada kelas praktikum</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((day) => {
                      const daySchedules = schedulesByDay[day] || [];
                      if (daySchedules.length === 0) return null;
                      
                      return (
                        <div key={day} className="border-b border-border pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="font-medium">
                              {dayNames[day]}
                            </Badge>
                          </div>
                          <div className="space-y-2 pl-4">
                            {daySchedules.map((schedule) => (
                              <div
                                key={schedule.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {schedule.course?.name || "Praktikum"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {schedule.course?.code}
                                  </p>
                                </div>
                                <div className="text-right text-sm">
                                  <p className="font-medium">
                                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {schedule.room || "TBA"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
