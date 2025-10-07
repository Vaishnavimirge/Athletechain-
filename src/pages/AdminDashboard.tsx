import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionHistory } from "@/components/TransactionHistory";
import { LogOut, Users, Activity, DollarSign } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAthletes: 0,
    totalSponsors: 0,
    totalVolume: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      toast.error("Access denied", { description: "This page is for admins only" });
      navigate("/");
      return;
    }

    setUser(user);
    fetchStats();
    setLoading(false);
  };

  const fetchStats = async () => {
    // Total users by role
    const { data: profiles } = await supabase.from("profiles").select("role");
    
    const athletes = profiles?.filter(p => p.role === "athlete").length || 0;
    const sponsors = profiles?.filter(p => p.role === "sponsor").length || 0;
    const total = profiles?.length || 0;

    // Transaction stats
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, status")
      .eq("status", "completed");

    const volume = transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
    const txCount = transactions?.length || 0;

    setStats({
      totalUsers: total,
      totalAthletes: athletes,
      totalSponsors: sponsors,
      totalVolume: volume,
      totalTransactions: txCount,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">System Overview</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAthletes} athletes, {stats.totalSponsors} sponsors
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border glow-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {stats.totalVolume.toFixed(4)} ETH
              </div>
              <p className="text-xs text-muted-foreground">
                All-time transaction volume
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border glow-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Completed transfers
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Athletes</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAthletes}</div>
              <p className="text-xs text-muted-foreground">
                Registered athletes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* All Transactions */}
        <TransactionHistory userId={user.id} userRole="admin" />
      </div>
    </div>
  );
};

export default AdminDashboard;
