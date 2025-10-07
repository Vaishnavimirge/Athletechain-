import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletConnect } from "@/components/WalletConnect";
import { TransactionHistory } from "@/components/TransactionHistory";
import { WithdrawForm } from "@/components/WithdrawForm";
import { LogOut, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

const AthleteDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [balance, setBalance] = useState(0);
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

    if (profile?.role !== "athlete") {
      toast.error("Access denied", { description: "This page is for athletes only" });
      navigate("/");
      return;
    }

    setUser(user);
    setProfile(profile);
    fetchBalance(user.id);
    setLoading(false);
  };

  const fetchBalance = async (userId: string) => {
    const { data } = await supabase
      .from("transactions")
      .select("amount")
      .eq("athlete_id", userId)
      .eq("status", "completed");

    const total = data?.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) || 0;
    setBalance(total);
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
            <h1 className="text-3xl font-bold gradient-text">Athlete Dashboard</h1>
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
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">
                {balance.toFixed(4)} ETH
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From all sponsors
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border glow-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">
                {balance.toFixed(4)} ETH
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready to withdraw
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdraw Form */}
        <WithdrawForm
          availableBalance={balance}
          walletAddress={profile?.wallet_address}
          onWithdraw={() => fetchBalance(user.id)}
        />

        {/* Transaction History */}
        <TransactionHistory userId={user.id} userRole="athlete" />
      </div>
    </div>
  );
};

export default AthleteDashboard;
