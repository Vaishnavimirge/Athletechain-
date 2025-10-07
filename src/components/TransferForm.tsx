import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface Athlete {
  id: string;
  full_name: string;
  wallet_address: string | null;
}

interface TransferFormProps {
  sponsorId: string;
  onTransferComplete?: () => void;
}

export const TransferForm = ({ sponsorId, onTransferComplete }: TransferFormProps) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, wallet_address")
        .eq("role", "athlete");

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast.error("Failed to load athletes");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAthlete || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      // Simulate blockchain transaction
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

      const { error } = await supabase.from("transactions").insert({
        athlete_id: selectedAthlete,
        sponsor_id: sponsorId,
        amount: amountNum,
        tx_hash: mockTxHash,
        status: "completed",
      });

      if (error) throw error;

      toast.success("Transfer successful!", {
        description: `${amountNum} ETH transferred successfully`,
      });

      setSelectedAthlete("");
      setAmount("");
      onTransferComplete?.();
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast.error("Transfer failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-border glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          New Fund Transfer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="athlete">Select Athlete</Label>
            <Select value={selectedAthlete} onValueChange={setSelectedAthlete}>
              <SelectTrigger id="athlete" className="bg-background/50">
                <SelectValue placeholder="Choose an athlete" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map((athlete) => (
                  <SelectItem key={athlete.id} value={athlete.id}>
                    {athlete.full_name}
                    {athlete.wallet_address && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({athlete.wallet_address.slice(0, 6)}...
                        {athlete.wallet_address.slice(-4)})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Send className="h-4 w-4" />
            {loading ? "Processing..." : "Transfer Funds"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
