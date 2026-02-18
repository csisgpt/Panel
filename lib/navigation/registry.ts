import {
  LucideIcon,
  LayoutDashboard,
  ScrollText,
  Receipt,
  Users,
  Banknote,
  MapPinned,
  History,
  UserCircle,
  MoreHorizontal,
  Shield,
  Tags,
  FileStack,
  Cog,
  Activity,
  Link as LinkIcon,
  NotepadText,
  Layers,
  FileText,
  Scale,
  UsersRound,
  Scale3D,
  BadgePercent,
} from "lucide-react";
import { UserRole } from "@/lib/types/backend";
import { features } from "@/lib/features";

export interface NavigationItem {
  key: string;
  labelFa: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  featureFlag?: boolean;
}

const userPanelRoles = [UserRole.CLIENT, UserRole.TRADER];

export const traderNavItems: NavigationItem[] = [
  {
    key: "dashboard",
    labelFa: "خانه",
    href: "/trader/dashboard",
    icon: LayoutDashboard,
    roles: userPanelRoles,
    featureFlag: true,
  },
  {
    key: "requests",
    labelFa: "درخواست‌ها",
    href: "/trader/requests",
    icon: Receipt,
    roles: userPanelRoles,
    featureFlag: features.trader.requests,
  },
  {
    key: "payer",
    labelFa: "پرداخت‌ها",
    href: "/trader/p2p/payer",
    icon: Banknote,
    roles: userPanelRoles,
    featureFlag: features.trader.p2p,
  },
  {
    key: "receiver",
    labelFa: "دریافت‌ها",
    href: "/trader/p2p/receiver",
    icon: ScrollText,
    roles: userPanelRoles,
    featureFlag: features.trader.p2p,
  },
  {
    key: "destinations",
    labelFa: "مقصدها",
    href: "/trader/destinations",
    icon: Users,
    roles: userPanelRoles,
    featureFlag: features.trader.destinations,
  },
  {
    key: "history",
    labelFa: "تاریخچه",
    href: "/trader/history",
    icon: History,
    roles: userPanelRoles,
    featureFlag: true,
  },
  {
    key: "profile",
    labelFa: "پروفایل",
    href: "/trader/profile",
    icon: UserCircle, // اگر آیکن دیگری دارید همان را بگذارید
    roles: userPanelRoles,
    featureFlag: true,
  },

];

export const traderBottomNav = {
  tabs: [
    { key: "dashboard", labelFa: "خانه", href: "/trader/dashboard", icon: LayoutDashboard },
    { key: "requests", labelFa: "درخواست‌ها", href: "/trader/requests", icon: Receipt, featureFlag: features.trader.requests },
    { key: "payer", labelFa: "پرداخت‌ها", href: "/trader/p2p/payer", icon: Banknote, featureFlag: features.trader.p2p },
    { key: "receiver", labelFa: "دریافت‌ها", href: "/trader/p2p/receiver", icon: ScrollText, featureFlag: features.trader.p2p },
    { key: "more", labelFa: "بیشتر", href: "#more", icon: MoreHorizontal },
  ],
  moreItems: [
    {
      key: "destinations",
      labelFa: "مقصدها",
      href: "/trader/destinations",
      icon: MapPinned,
      featureFlag: features.trader.destinations,
    },
    {
      key: "history",
      labelFa: "تاریخچه",
      href: "/trader/history",
      icon: History,
      featureFlag: true,
    },
    {
      key: "profile",
      labelFa: "پروفایل",
      href: "/trader/profile",
      icon: UserCircle,
      featureFlag: true,
    },
    { key: "logout", labelFa: "خروج", href: "/logout", icon: MoreHorizontal, featureFlag: true },
  ],
};

export const adminNavItems: NavigationItem[] = [
  { key: "dashboard", labelFa: "داشبورد", href: "/admin/dashboard", icon: Shield, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "p2p-ops", labelFa: "عملیات P2P", href: "/admin/p2p/ops", icon: Activity, roles: [UserRole.ADMIN], featureFlag: features.admin.p2p },
  { key: "p2p-withdrawals", labelFa: "صف برداشت P2P", href: "/admin/p2p/withdrawals", icon: FileStack, roles: [UserRole.ADMIN], featureFlag: features.admin.p2p },
  { key: "p2p-allocations", labelFa: "تخصیص‌های P2P", href: "/admin/p2p/allocations", icon: ScrollText, roles: [UserRole.ADMIN], featureFlag: features.admin.p2p },
  { key: "deposits", labelFa: "واریزها", href: "/admin/deposits", icon: Receipt, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "withdrawals", labelFa: "برداشت‌ها", href: "/admin/withdrawals", icon: Banknote, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "users", labelFa: "کاربران", href: "/admin/users", icon: Users, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "customer-groups", labelFa: "گروه‌های مشتری", href: "/admin/customer-groups", icon: UsersRound, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "kyc", labelFa: "صف احراز هویت", href: "/admin/kyc", icon: FileText, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "policy-rules", labelFa: "قوانین سیاست", href: "/admin/policy-rules", icon: Scale, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "tahesab-outbox", labelFa: "خروجی ته‌حساب", href: "/admin/tahesab/outbox", icon: FileStack, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "instruments", labelFa: "ابزارها", href: "/admin/instruments", icon: Tags, roles: [UserRole.ADMIN], featureFlag: false },
  { key: "pricing", labelFa: "قیمت‌گذاری", href: "/admin/pricing", icon: NotepadText, roles: [UserRole.ADMIN], featureFlag: false },
  { key: "pricing-logs", labelFa: "گزارش قیمت", href: "/admin/pricing/logs", icon: Activity, roles: [UserRole.ADMIN], featureFlag: false },
  { key: "tahesab-overview", labelFa: "مرور ته‌حساب", href: "/admin/tahesab/overview", icon: LayoutDashboard, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-connection", labelFa: "اتصال تاهساب", href: "/admin/tahesab/connection", icon: LinkIcon, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-mapping", labelFa: "نگاشت", href: "/admin/tahesab/mapping", icon: Layers, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-reconciliation", labelFa: "مغایرت‌ها", href: "/admin/tahesab/reconciliation", icon: Scale, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-documents", labelFa: "سندهای تاهساب", href: "/admin/tahesab/documents", icon: FileText, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-raw-documents", labelFa: "اسناد خام ته‌حساب", href: "/admin/tahesab/raw-documents", icon: FileStack, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-customers", labelFa: "مشتریان ته‌حساب", href: "/admin/tahesab/customers", icon: UsersRound, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-balances", labelFa: "موجودی و تراز", href: "/admin/tahesab/balances", icon: Scale3D, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-master-data", labelFa: "اطلاعات پایه ته‌حساب", href: "/admin/tahesab/master-data", icon: FileText, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-tags", labelFa: "اتیکت‌ها", href: "/admin/tahesab/tags", icon: Tags, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-manual-documents", labelFa: "اسناد دستی", href: "/admin/tahesab/manual-documents", icon: BadgePercent, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "tahesab-logs", labelFa: "گزارش تاهساب", href: "/admin/tahesab/logs", icon: FileStack, roles: [UserRole.ADMIN], featureFlag: features.admin.tahesab },
  { key: "risk-settings", labelFa: "تنظیمات ریسک", href: "/admin/risk/settings", icon: Cog, roles: [UserRole.ADMIN], featureFlag: features.admin.risk },
  { key: "risk-monitor", labelFa: "پایش ریسک", href: "/admin/risk/monitor", icon: Activity, roles: [UserRole.ADMIN], featureFlag: features.admin.risk },
  { key: "files", labelFa: "فایل‌ها", href: "/admin/files", icon: FileStack, roles: [UserRole.ADMIN], featureFlag: features.admin.files },
  { key: "settings", labelFa: "تنظیمات", href: "/admin/settings", icon: Cog, roles: [UserRole.ADMIN], featureFlag: features.admin.settings },
];

export function getVisibleNav(items: NavigationItem[]) {
  return items.filter((item) => item.featureFlag !== false);
}
