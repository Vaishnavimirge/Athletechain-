import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Wallet } from "lucide-react";
import { toast } from "sonner";

interface WithdrawFormProps {
  availableBalance: number;
  walletAddress: string | null;
  onWithdraw?: () => void;
}

export const WithdrawForm = ({
  availableBalance,
  walletAddress,
  onWithdraw,
}: WithdrawFormProps) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amountNum > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      // Simulate blockchain withdrawal
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Withdrawal successful!", {
        description: `${amountNum} ETH withdrawn to your wallet`,
      });

      setAmount("");
      onWithdraw?.();
    } catch (error) {
      console.error("Withdraw error:", error);
      toast.error("Withdrawal failed", {
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-border glow-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-secondary" />
          Withdraw Funds
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="text-2xl font-bold gradient-text">
                {availableBalance.toFixed(4)} ETH
              </span>
            </div>
            {walletAddress ? (
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-mono text-muted-foreground">
                  {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-destructive">⚠️ No wallet connected</p>
            )}
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount (ETH)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50"
              />
              <Button
                type="button"
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={() => setAmount(availableBalance.toString())}
              >
                Withdraw Max
              </Button>
            </div>

            <Button
              type="submit"
              disabled={loading || !walletAddress}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? "Processing..." : "Withdraw Funds"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
