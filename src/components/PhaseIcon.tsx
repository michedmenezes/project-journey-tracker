import {
  Search, ClipboardList, Hammer, FlaskConical, Trophy,
  Lightbulb, Rocket, Target, Star, BookOpen,
  Pencil, Compass, Wrench, Zap, Heart,
  Flag, Award, Map, Eye, Brain,
} from "lucide-react";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Search, ClipboardList, Hammer, FlaskConical, Trophy,
  Lightbulb, Rocket, Target, Star, BookOpen,
  Pencil, Compass, Wrench, Zap, Heart,
  Flag, Award, Map, Eye, Brain,
};

interface PhaseIconProps {
  icon: string;
  className?: string;
}

export default function PhaseIcon({ icon, className }: PhaseIconProps) {
  const Icon = iconMap[icon] || Star;
  return <Icon className={className} />;
}
