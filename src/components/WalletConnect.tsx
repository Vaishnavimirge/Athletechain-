import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export const WalletConnect = ({ onConnect, onDisconnect }: WalletConnectProps) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          onConnect?.(address);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("MetaMask not detected", {
        description: "Please install MetaMask to connect your wallet",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      setWalletAddress(address);
      onConnect?.(address);
      toast.success("Wallet connected!", {
        description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error("Connection failed", {
        description: error.message || "Failed to connect wallet",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    onDisconnect?.();
    toast.info("Wallet disconnected");
  };

  if (walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="glass-card px-3 py-2 rounded-lg">
          <p className="text-sm font-mono text-primary">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="gap-2 glow-primary"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};
