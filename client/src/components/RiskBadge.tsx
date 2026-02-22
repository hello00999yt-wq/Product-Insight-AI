import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

interface RiskBadgeProps {
  level: string; // 'Low' | 'Medium' | 'High'
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const normalizedLevel = level.toLowerCase();
  
  let colorClass = "bg-green-100 text-green-700 border-green-200";
  let Icon = ShieldCheck;
  let label = "Safe / Authentic";

  if (normalizedLevel === "high") {
    colorClass = "bg-red-100 text-red-700 border-red-200";
    Icon = ShieldAlert;
    label = "High Risk / Likely Fake";
  } else if (normalizedLevel === "medium") {
    colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    Icon = AlertTriangle;
    label = "Medium Risk / Caution";
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full border font-semibold shadow-sm w-fit",
      colorClass,
      className
    )}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </div>
  );
}
