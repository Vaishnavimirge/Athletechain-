import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletConnect } from "@/components/WalletConnect";
import { TransactionHistory } from "@/components/TransactionHistory";
import { TransferForm } from "@/components/TransferForm";
import { LogOut, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [totalSent, setTotalSent] = useState(0);
  const [athleteCount, setAthleteCount] = useState(0);
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

    if (profile?.role !== "sponsor") {
      toast.error("Access denied", { description: "This page is for sponsors only" });
      navigate("/");
      return;
    }

    setUser(user);
    setProfile(profile);
    fetchStats(user.id);
    setLoading(false);
  };

  const fetchStats = async (userId: string) => {
    // Total sent
    const { data: txData } = await supabase
      .from("transactions")
      .select("amount")
      .eq("sponsor_id", userId)
      .eq("status", "completed");

    const total = txData?.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
    setTotalSent(total);

    // Unique athletes funded
    const { data: athleteData } = await supabase
      .from("transactions")
      .select("athlete_id")
      .eq("sponsor_id", userId);

    const uniqueAthletes = new Set(athleteData?.map(tx => tx.athlete_id));
    setAthleteCount(uniqueAthletes.size);
  };

  const handleWalletConnect = async (address: string) => {
    if (profile) {
      await supabase
        .from("profiles")
        .update({ wallet_address: address })
        .eq("id", profile.id);
      setProfile({ ...profile, wallet_address: address });
    }
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
            <h1 className="text-3xl font-bold gradient-text">Sponsor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <WalletConnect onConnect={handleWalletConnect} />
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card border-border glow-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">
                {totalSent.toFixed(4)} ETH
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all athletes
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border glow-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Athletes Supported</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">
                {athleteCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique recipients
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Form */}
        <TransferForm
          sponsorId={user.id}
          onTransferComplete={() => fetchStats(user.id)}
        />

        {/* Transaction History */}
        <TransactionHistory userId={user.id} userRole="sponsor" />
      </div>
    </div>
  );
};

export default SponsorDashboard;
