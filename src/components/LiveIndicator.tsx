import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

export const LiveIndicator = ({ connected }: { connected: boolean }) => (
  <div className="flex items-center gap-2 text-xs">
    {connected ? (
      <>
        <motion.div
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
        <Wifi className="h-3.5 w-3.5 text-primary" />
        <span className="text-primary font-medium">Live</span>
      </>
    ) : (
      <>
        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
        <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">Connecting…</span>
      </>
    )}
  </div>
);
