import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, TrendingUp, Users, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // User is logged in, redirect to appropriate dashboard
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "admin") {
        navigate("/admin");
      } else if (profile?.role === "sponsor") {
        navigate("/sponsor");
      } else {
        navigate("/athlete");
      }
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Zap className="h-12 w-12 text-primary glow-primary" />
              <h1 className="text-5xl sm:text-7xl font-bold gradient-text">
                DirectPay Chain
              </h1>
            </div>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Blockchain-powered direct athlete funding. Remove intermediaries. 
              Enable instant, transparent, and immutable transactions between sponsors and athletes.
            </p>

            <div className="flex gap-4 justify-center pt-8">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 glow-primary text-lg px-8"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why <span className="gradient-text">DirectPay Chain?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            The future of athlete funding is here
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-border hover:glow-primary transition-all">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">No Middleman</h3>
              <p className="text-sm text-muted-foreground">
                Direct smart contract transfers from sponsor to athlete wallets
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border hover:glow-secondary transition-all">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-bold text-lg">Instant Transfers</h3>
              <p className="text-sm text-muted-foreground">
                Blockchain-speed transactions with real-time confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border hover:glow-primary transition-all">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold text-lg">100% Transparent</h3>
              <p className="text-sm text-muted-foreground">
                Immutable transaction records on the blockchain
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border hover:glow-secondary transition-all">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-bold text-lg">Role-Based Access</h3>
              <p className="text-sm text-muted-foreground">
                Secure dashboards for athletes, sponsors, and administrators
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Card className="glass-card border-border glow-primary">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <h2 className="text-3xl font-bold gradient-text">
              Ready to revolutionize athlete funding?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join athletes and sponsors already using DirectPay Chain
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2 text-lg px-8"
            >
              Create Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
