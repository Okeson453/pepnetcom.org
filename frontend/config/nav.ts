import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  GraduationCap,
  LineChart,
  TrendingUp,
  Megaphone,
  GlobeLock,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  Settings,
  BarChart3,
  Radio,
  ClipboardList,
  Wallet,
  Bell,
  Files,
  Calendar,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  /** Icon component (not a rendered element) — this file has no JSX, so the sidebar renders it. */
  icon?: LucideIcon;
  section?: string;
}

/**
 * Admin dashboard navigation — one entry per route under app/(admin)/admin/**.
 * Grouped by `section` to keep 57 routes scannable in a single sidebar.
 */
export const adminNav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, section: "Dashboard" },

  { label: "All Orders", href: "/admin/orders", icon: ShoppingCart, section: "Orders" },
  { label: "Order Tracking", href: "/admin/orders/tracking", icon: ClipboardList, section: "Orders" },
  { label: "Assign Staff", href: "/admin/orders/assign-staff", icon: Users, section: "Orders" },

  { label: "SIWES Orders", href: "/admin/siwes/orders", icon: FileText, section: "SIWES" },

  { label: "Academic Orders", href: "/admin/academic/orders", icon: GraduationCap, section: "Academic Services" },
  { label: "Assignments", href: "/admin/academic/assignments", icon: ClipboardList, section: "Academic Services" },
  { label: "Subjects", href: "/admin/academic/subjects", icon: FileText, section: "Academic Services" },

  { label: "Education Requests", href: "/admin/education-consultant/requests", icon: GraduationCap, section: "Education Consultant" },
  { label: "Applications", href: "/admin/education-consultant/applications", icon: ClipboardList, section: "Education Consultant" },
  { label: "Universities", href: "/admin/education-consultant/universities", icon: FileText, section: "Education Consultant" },
  { label: "Countries", href: "/admin/education-consultant/countries", icon: GlobeLock, section: "Education Consultant" },

  { label: "Trade Strategies", href: "/admin/trade-strategies", icon: TrendingUp, section: "Trade Strategies" },
  { label: "New Strategy", href: "/admin/trade-strategies/new", icon: TrendingUp, section: "Trade Strategies" },
  { label: "Strategy Sales", href: "/admin/trade-strategies/sales", icon: BarChart3, section: "Trade Strategies" },

  { label: "Signals", href: "/admin/signals", icon: Radio, section: "Signals" },
  { label: "New Signal", href: "/admin/signals/new", icon: Radio, section: "Signals" },
  { label: "Signal History", href: "/admin/signals/history", icon: ClipboardList, section: "Signals" },
  { label: "Subscribers", href: "/admin/signals/subscribers", icon: Users, section: "Signals" },

  { label: "Campaigns", href: "/admin/digital-marketing/campaigns", icon: Megaphone, section: "Digital Marketing" },
  { label: "Projects", href: "/admin/digital-marketing/projects", icon: ClipboardList, section: "Digital Marketing" },
  { label: "Deliverables", href: "/admin/digital-marketing/deliverables", icon: Files, section: "Digital Marketing" },
  { label: "Client Reports", href: "/admin/digital-marketing/client-reports", icon: FileText, section: "Digital Marketing" },

  { label: "Blog Posts", href: "/admin/cms/blog-posts", icon: FileText, section: "CMS" },
  { label: "Categories", href: "/admin/cms/categories", icon: FileText, section: "CMS" },
  { label: "Testimonials", href: "/admin/cms/testimonials", icon: MessageSquare, section: "CMS" },
  { label: "FAQs", href: "/admin/cms/faqs", icon: FileText, section: "CMS" },
  { label: "Media Library", href: "/admin/cms/media-library", icon: Files, section: "CMS" },

  { label: "Users", href: "/admin/users", icon: Users, section: "Users" },
  { label: "New User", href: "/admin/users/new", icon: Users, section: "Users" },
  { label: "Roles & Permissions", href: "/admin/users/roles", icon: GlobeLock, section: "Users" },

  { label: "Transactions", href: "/admin/payments/transactions", icon: CreditCard, section: "Payments" },
  { label: "Invoices", href: "/admin/payments/invoices", icon: FileText, section: "Payments" },
  { label: "Refunds", href: "/admin/payments/refunds", icon: Wallet, section: "Payments" },
  { label: "Gateways", href: "/admin/payments/gateways", icon: CreditCard, section: "Payments" },

  { label: "Sales", href: "/admin/analytics/sales", icon: BarChart3, section: "Analytics" },
  { label: "Website", href: "/admin/analytics/website", icon: LineChart, section: "Analytics" },
  { label: "Signal Performance", href: "/admin/analytics/signal-performance", icon: LineChart, section: "Analytics" },
  { label: "Reports", href: "/admin/analytics/reports", icon: FileText, section: "Analytics" },

  { label: "Messages", href: "/admin/communication/messages", icon: MessageSquare, section: "Communication" },
  { label: "Live Chat", href: "/admin/communication/live-chat", icon: MessageSquare, section: "Communication" },
  { label: "Email Broadcast", href: "/admin/communication/email-broadcast", icon: Megaphone, section: "Communication" },
  { label: "Notifications", href: "/admin/communication/notifications", icon: Bell, section: "Communication" },

  { label: "General", href: "/admin/settings/general", icon: Settings, section: "Settings" },
  { label: "Company", href: "/admin/settings/company", icon: Settings, section: "Settings" },
  { label: "Security", href: "/admin/settings/security", icon: GlobeLock, section: "Settings" },
  { label: "Email", href: "/admin/settings/email", icon: Settings, section: "Settings" },
  { label: "SMS", href: "/admin/settings/sms", icon: Settings, section: "Settings" },
  { label: "API Keys", href: "/admin/settings/api-keys", icon: Settings, section: "Settings" },
  { label: "Backup", href: "/admin/settings/backup", icon: Settings, section: "Settings" },
];

/** Client dashboard navigation — one entry per route under app/(client)/dashboard/**. */
export const clientNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, section: "Dashboard" },
  { label: "My Orders", href: "/dashboard/orders", icon: ShoppingCart, section: "Orders" },
  { label: "Place New Order", href: "/dashboard/orders/new", icon: ShoppingCart, section: "Orders" },
  { label: "Saved Files", href: "/dashboard/saved-files", icon: Files, section: "Files" },
  { label: "Downloads", href: "/dashboard/downloads", icon: Files, section: "Files" },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard, section: "Billing" },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText, section: "Billing" },
  { label: "Subscription", href: "/dashboard/subscription", icon: Wallet, section: "Billing" },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, section: "Support" },
  { label: "Support Tickets", href: "/dashboard/support-tickets", icon: ClipboardList, section: "Support" },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, section: "Support" },
  { label: "Profile", href: "/dashboard/profile", icon: User, section: "Account" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, section: "Account" },
];

/** Writer dashboard navigation — one entry per route under app/(writer)/writer/**. */
export const writerNav: NavItem[] = [
  { label: "Overview", href: "/writer", icon: LayoutDashboard, section: "Dashboard" },
  { label: "Assigned Orders", href: "/writer/assigned-orders", icon: ClipboardList, section: "Work" },
  { label: "Calendar", href: "/writer/calendar", icon: Calendar, section: "Work" },
  { label: "Earnings", href: "/writer/earnings", icon: Wallet, section: "Work" },
  { label: "Messages", href: "/writer/messages", icon: MessageSquare, section: "Communication" },
  { label: "Notifications", href: "/writer/notifications", icon: Bell, section: "Communication" },
  { label: "Profile", href: "/writer/profile", icon: User, section: "Account" },
  { label: "Settings", href: "/writer/settings", icon: Settings, section: "Account" },
];
