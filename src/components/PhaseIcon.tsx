import { Search, ClipboardList, Hammer, FlaskConical, Trophy } from "lucide-react";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Search,
  ClipboardList,
  Hammer,
  FlaskConical,
  Trophy,
};

interface PhaseIconProps {
  icon: string;
  className?: string;
}

export default function PhaseIcon({ icon, className }: PhaseIconProps) {
  const Icon = iconMap[icon] || Search;
  return <Icon className={className} />;
}
