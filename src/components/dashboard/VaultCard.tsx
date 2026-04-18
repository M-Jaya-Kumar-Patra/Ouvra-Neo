"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { VaultForm } from "./VaultForm";
import { useEffect, useState } from "react";

interface VaultProps {
  id: string;
  userId: string;
  name: string;
  target: number;
  current: number;
  isRoundUpEnabled: boolean;
}

export function VaultCard({ id, userId, name, target, current, isRoundUpEnabled }: VaultProps) {
  const progress = Math.min((current / target) * 100, 100);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const calculated = (current / target) * 100;
      setDisplayProgress(Math.min(calculated, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [current, target]);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden group transition-all hover:border-zinc-700">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          {name}
        </CardTitle>

        <div className="flex items-center gap-2">
          {isRoundUpEnabled && (
            <div className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" /> ACTIVE
            </div>
          )}
          
          <VaultForm 
            mode="edit" 
            initialData={{ 
              id, 
              name, 
              targetAmount: target, 
              roundUpEnabled: isRoundUpEnabled 
            }} 
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xl font-bold text-white">₹{current.toLocaleString()}</span>
            <span className="text-zinc-500 text-sm">of ₹{target.toLocaleString()}</span>
          </div>
          <Progress value={displayProgress} className="h-2 bg-zinc-800" />
        </div>
        
        <p className={cn(
          "text-xs italic",
          progress >= 100 ? "text-green-400" : "text-zinc-500"
        )}>
          {progress >= 100 ? "Goal achieved! 🎉" : `${(100 - progress).toFixed(0)}% more to reach your goal.`}
        </p>
      </CardContent>
    </Card>
  );
}