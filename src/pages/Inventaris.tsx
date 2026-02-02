import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Search, Loader2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  total_quantity: number;
  available_quantity: number;
  image_url: string | null;
}

export default function Inventaris() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Rental dialog state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [rentalQuantity, setRentalQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRental = async () => {
    if (!selectedItem || !user) return;

    if (rentalQuantity > selectedItem.available_quantity) {
      toast({
        variant: "destructive",
        title: "Stok Tidak Cukup",
        description: `Hanya tersedia ${selectedItem.available_quantity} unit`,
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create rental record
      const { error: rentalError } = await supabase
        .from("rentals")
        .insert({
          user_id: user.id,
          item_id: selectedItem.id,
          quantity: rentalQuantity,
          rental_date: new Date().toISOString().split("T")[0],
          status: "active",
        });

      if (rentalError) throw rentalError;

      // Update available quantity
      const { error: updateError } = await supabase
        .from("inventory_items")
        .update({
          available_quantity: selectedItem.available_quantity - rentalQuantity,
        })
        .eq("id", selectedItem.id);

      if (updateError) throw updateError;

      toast({
        title: "Peminjaman Berhasil",
        description: `${rentalQuantity}x ${selectedItem.name} berhasil dipinjam`,
      });

      // Update local state
      setItems(prev =>
        prev.map(item =>
          item.id === selectedItem.id
            ? { ...item, available_quantity: item.available_quantity - rentalQuantity }
            : item
        )
      );

      setSelectedItem(null);
      setRentalQuantity(1);
    } catch (err) {
      console.error("Error creating rental:", err);
      toast({
        variant: "destructive",
        title: "Gagal Meminjam",
        description: "Terjadi kesalahan saat membuat peminjaman",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      filterCategory === "all" || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalItems: items.length,
    totalStock: items.reduce((acc, item) => acc + item.total_quantity, 0),
    availableStock: items.reduce((acc, item) => acc + item.available_quantity, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventaris Lab</h1>
          <p className="text-muted-foreground mt-1">
            Katalog peralatan dan sistem peminjaman
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalItems}</p>
                  <p className="text-sm text-muted-foreground">Jenis Barang</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalStock}</p>
                  <p className="text-sm text-muted-foreground">Total Unit</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.availableStock}</p>
                  <p className="text-sm text-muted-foreground">Unit Tersedia</p>
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
              placeholder="Cari peralatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("all")}
            >
              Semua
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={filterCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(category!)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">
                  {searchQuery ? "Peralatan tidak ditemukan" : "Belum ada peralatan tersedia"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="card-elevated overflow-hidden">
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-muted-foreground/30" />
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    {item.category && (
                      <Badge variant="outline" className="shrink-0">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tersedia</p>
                      <p className="text-lg font-semibold">
                        <span className={item.available_quantity > 0 ? "text-success" : "text-destructive"}>
                          {item.available_quantity}
                        </span>
                        <span className="text-muted-foreground text-sm"> / {item.total_quantity}</span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={item.available_quantity === 0}
                      onClick={() => {
                        setSelectedItem(item);
                        setRentalQuantity(1);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Pinjam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rental Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pinjam Peralatan</DialogTitle>
              <DialogDescription>
                {selectedItem?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Jumlah</p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRentalQuantity(Math.max(1, rentalQuantity - 1))}
                    disabled={rentalQuantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-3xl font-bold w-16 text-center">{rentalQuantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRentalQuantity(rentalQuantity + 1)}
                    disabled={rentalQuantity >= (selectedItem?.available_quantity || 0)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tersedia: {selectedItem?.available_quantity} unit
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Batal
              </Button>
              <Button onClick={handleRental} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Konfirmasi Pinjam"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
