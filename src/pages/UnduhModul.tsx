import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Search, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  title: string;
  description: string | null;
  module_number: number;
  file_url: string | null;
  course: {
    name: string;
    code: string;
  } | null;
}

export default function UnduhModul() {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select(`
          id,
          title,
          description,
          module_number,
          file_url,
          courses (
            name,
            code
          )
        `)
        .order("module_number", { ascending: true });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        course: item.courses as { name: string; code: string } | null
      }));
      
      setModules(transformedData);
    } catch (err) {
      console.error("Error fetching modules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (module: Module) => {
    if (module.file_url) {
      window.open(module.file_url, "_blank");
      toast({
        title: "Mengunduh Modul",
        description: `Modul ${module.module_number}: ${module.title}`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "File Tidak Tersedia",
        description: "Modul ini belum memiliki file yang dapat diunduh",
      });
    }
  };

  const filteredModules = modules.filter(module => 
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.course?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group modules by course
  const modulesByCourse = filteredModules.reduce((acc, module) => {
    const courseName = module.course?.name || "Lainnya";
    if (!acc[courseName]) acc[courseName] = [];
    acc[courseName].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Unduh Modul</h1>
            <p className="text-muted-foreground mt-1">
              Akses materi praktikum dalam format PDF
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari modul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{modules.length}</p>
                  <p className="text-sm text-muted-foreground">Total Modul</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {modules.filter(m => m.file_url).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Tersedia</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">PDF</p>
                  <p className="text-sm text-muted-foreground">Format File</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredModules.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">
                  {searchQuery ? "Modul tidak ditemukan" : "Belum ada modul tersedia"}
                </p>
                <p className="text-sm mt-1">
                  {searchQuery 
                    ? "Coba kata kunci lain" 
                    : "Modul akan ditampilkan setelah ditambahkan oleh koordinator"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(modulesByCourse).map(([courseName, courseModules]) => (
              <Card key={courseName} className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {courseName}
                  </CardTitle>
                  <CardDescription>
                    {courseModules.length} modul tersedia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courseModules.map((module) => (
                      <div
                        key={module.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {module.module_number}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {module.title}
                            </p>
                            {module.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {module.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {module.file_url ? (
                            <Badge className="bg-success/10 text-success border-success/20">
                              Tersedia
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Segera
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant={module.file_url ? "default" : "outline"}
                            onClick={() => handleDownload(module)}
                            disabled={!module.file_url}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Unduh
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
