import React from 'react';
import { LucideProps } from 'lucide-react';
import {
  Home,
  Book,
  Users,
  User,
  FileText,
  Package,
  Video,
  BarChart2,
  Menu,
  Search,
  Bell,
  HelpCircle,
  Plus,
  Settings,
  X,
  LogOut,
  Check,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react';

export type IconName = 
  | 'home'
  | 'book'
  | 'users'
  | 'user'
  | 'file-text'
  | 'package'
  | 'video'
  | 'bar-chart'
  | 'menu'
  | 'search'
  | 'bell'
  | 'help-circle'
  | 'plus'
  | 'settings'
  | 'x'
  | 'log-out'
  | 'check'
  | 'trending-up'
  | 'trending-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'message'
  | 'eye'
  | 'download';

interface IconProps extends LucideProps {
  name: IconName;
}

const iconMap: Record<IconName, React.ComponentType<LucideProps>> = {
  'home': Home,
  'book': Book,
  'users': Users,
  'user': User,
  'file-text': FileText,
  'package': Package,
  'video': Video,
  'bar-chart': BarChart2,
  'menu': Menu,
  'search': Search,
  'bell': Bell,
  'help-circle': HelpCircle,
  'plus': Plus,
  'settings': Settings,
  'x': X,
  'log-out': LogOut,
  'check': Check,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'message': MessageSquare,
  'eye': Eye,
  'download': Download
};

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = iconMap[name];
  return <LucideIcon {...props} />;
};

export default Icon;
