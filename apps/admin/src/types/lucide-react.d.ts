import type { ComponentType, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

declare module "lucide-react" {
  type LucideIcon = ComponentType<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  
  // Override all lucide-react icon exports to use ComponentType instead of ForwardRefExoticComponent
  // This fixes React 19 compatibility where ReactNode includes bigint
  export const ChevronLeft: LucideIcon;
  export const Ban: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Plus: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Users: LucideIcon;
  export const CreditCard: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Activity: LucideIcon;
  export const CircleUser: LucideIcon;
  export const LogOut: LucideIcon;
  export const EyeClosed: LucideIcon;
  export const EyeIcon: LucideIcon;
  export const Menu: LucideIcon;
  export const Copy: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const XCircle: LucideIcon;
  export const Calculator: LucideIcon;
  export const Wallet: LucideIcon;
  export const BadgeCent: LucideIcon;
  export const Blocks: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Save: LucideIcon;
  export const CheckIcon: LucideIcon;
  export const ChevronDownIcon: LucideIcon;
  export const ChevronUpIcon: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Mail: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
}

