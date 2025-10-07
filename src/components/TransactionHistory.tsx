import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  tx_hash: string | null;
  status: string;
  created_at: string;
  athlete: { full_name: string };
  sponsor: { full_name: string };
}

interface TransactionHistoryProps {
  userId: string;
  userRole: "athlete" | "sponsor" | "admin";
}

export const TransactionHistory = ({ userId, userRole }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from("transactions")
        .select(
          `
          *,
          athlete:profiles!transactions_athlete_id_fkey(full_name),
          sponsor:profiles!transactions_sponsor_id_fkey(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (userRole !== "admin") {
        query = query.or(`athlete_id.eq.${userId},sponsor_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <Card className="glass-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          No transactions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Transaction History
          <Badge variant="secondary" className="ml-2">
            {transactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`p-2 rounded-full ${
                    userRole === "athlete" || tx.athlete.full_name
                      ? "bg-success/20"
                      : "bg-primary/20"
                  }`}
                >
                  {userRole === "athlete" ? (
                    <ArrowDownLeft className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {userRole === "athlete"
                        ? `From ${tx.sponsor.full_name}`
                        : `To ${tx.athlete.full_name}`}
                    </p>
                    {getStatusBadge(tx.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(tx.created_at), "MMM dd, yyyy • HH:mm")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold gradient-text">{tx.amount} ETH</p>
                {tx.tx_hash && (
                  <a
                    href={`https://etherscan.io/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                  >
                    View on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
