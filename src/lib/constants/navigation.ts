import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Pill,
  UserRound,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

export type PatientNavItem = NavItem & {
  icon: LucideIcon;
};

export const marketingNav: NavItem[] = [
  { title: "Treatments", href: "/treatments" },
  { title: "How it works", href: "/how-it-works" },
  { title: "FAQ", href: "/faq" },
  { title: "About", href: "/about" },
];

export const patientNav: PatientNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Intake", href: "/intake", icon: ClipboardList },
  { title: "Appointments", href: "/appointments", icon: CalendarDays },
  { title: "Prescriptions", href: "/prescriptions", icon: Pill },
  { title: "Messages", href: "/messages", icon: MessageSquare },
  { title: "Profile", href: "/profile", icon: UserRound },
];
