import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; // Pakai Client bawaan Template
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Cari user di tabel 'users' Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        throw new Error("Username tidak ditemukan.");
      }

      // 2. Cek Password (Sederhana)
      if (data.password !== password) {
        throw new Error("Password salah.");
      }

      // 3. Login Sukses -> Simpan Sesi
      localStorage.setItem("lab_session", JSON.stringify(data));
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${data.full_name}`,
      });

      navigate("/beranda"); // Pastikan route '/beranda' sudah ada
      
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Lab Cerdas</h1>
          <p className="text-gray-500">Masuk untuk mengakses sistem</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username / NIM</label>
            <Input 
              placeholder="Contoh: 12345678" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Memuat..." : "Masuk"}
          </Button>
        </form>
        
        <div className="text-center text-sm text-gray-500">
          <p>Lupa password? Hubungi Asisten Jaga.</p>
        </div>
      </div>
    </div>
  );
}
