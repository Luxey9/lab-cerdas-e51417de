import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClipboardCheck, Search, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  file_name: string;
  file_url: string;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  user_id: string;
  module: {
    title: string;
    module_number: number;
  } | null;
}

export default function InputNilai() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "graded" | "ungraded">("all");
  
  // Grading dialog state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id,
          file_name,
          file_url,
          submitted_at,
          grade,
          feedback,
          user_id,
          modules (
            title,
            module_number
          )
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        module: item.modules as { title: string; module_number: number } | null
      }));
      
      setSubmissions(transformedData);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission || !gradeValue) return;

    const grade = parseFloat(gradeValue);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      toast({
        variant: "destructive",
        title: "Nilai Tidak Valid",
        description: "Nilai harus berupa angka antara 0-100",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          grade: grade,
          feedback: feedbackValue || null,
          graded_at: new Date().toISOString(),
          graded_by: user?.id,
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Nilai Tersimpan",
        description: `Nilai ${grade} berhasil disimpan`,
      });

      // Update local state
      setSubmissions(prev => 
        prev.map(s => 
          s.id === selectedSubmission.id 
            ? { ...s, grade, feedback: feedbackValue || null }
            : s
        )
      );

      setSelectedSubmission(null);
      setGradeValue("");
      setFeedbackValue("");
    } catch (err) {
      console.error("Error saving grade:", err);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan nilai",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.module?.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "all" ||
      (filterStatus === "graded" && submission.grade !== null) ||
      (filterStatus === "ungraded" && submission.grade === null);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.grade !== null).length,
    ungraded: submissions.filter(s => s.grade === null).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Input Nilai</h1>
          <p className="text-muted-foreground mt-1">
            Berikan penilaian untuk laporan praktikan
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Laporan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.ungraded}</p>
                  <p className="text-sm text-muted-foreground">Belum Dinilai</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.graded}</p>
                  <p className="text-sm text-muted-foreground">Sudah Dinilai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="ungraded">Belum Dinilai</SelectItem>
              <SelectItem value="graded">Sudah Dinilai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submissions List */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Daftar Laporan</CardTitle>
            <CardDescription>
              Klik pada laporan untuk memberikan nilai
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Tidak ada laporan ditemukan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setGradeValue(submission.grade?.toString() || "");
                      setFeedbackValue(submission.feedback || "");
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {submission.module?.title || "Modul"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {submission.file_name} • {formatDate(submission.submitted_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {submission.grade !== null ? (
                        <Badge className="bg-success/10 text-success border-success/20">
                          Nilai: {submission.grade}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-warning border-warning/20">
                          Belum Dinilai
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grading Dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Input Nilai</DialogTitle>
              <DialogDescription>
                {selectedSubmission?.module?.title} - {selectedSubmission?.file_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nilai (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Masukkan nilai"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catatan / Feedback (Opsional)</label>
                <Textarea
                  placeholder="Berikan catatan untuk praktikan..."
                  value={feedbackValue}
                  onChange={(e) => setFeedbackValue(e.target.value)}
                  rows={3}
                />
              </div>
              {selectedSubmission?.file_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(selectedSubmission.file_url, "_blank")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Lihat Laporan
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                Batal
              </Button>
              <Button onClick={handleGrade} disabled={submitting || !gradeValue}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Nilai"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
