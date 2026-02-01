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
  Wallet,
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
    key: "transactions",
    labelFa: "تراکنش‌ها",
    href: "/trader/transactions",
    icon: ScrollText,
    roles: userPanelRoles,
    featureFlag: features.trader.transactions,
  },
  {
    key: "remittances",
    labelFa: "ثبت درخواست",
    href: "/trader/remittances",
    icon: Receipt,
    roles: userPanelRoles,
    featureFlag: features.trader.remittances,
  },
  {
    key: "customers",
    labelFa: "مقصدها",
    href: "/trader/customers",
    icon: Users,
    roles: userPanelRoles,
    featureFlag: features.trader.customers,
  },
  {
    key: "settlement",
    labelFa: "تسویه",
    href: "/trader/settlement",
    icon: Banknote,
    roles: userPanelRoles,
    featureFlag: features.trader.settlement,
  },
  {
    key: "prices",
    labelFa: "قیمت‌ها",
    href: "/trader/prices",
    icon: Tags,
    roles: userPanelRoles,
    featureFlag: features.trader.prices,
  },
  {
    key: "positions",
    labelFa: "دارایی‌ها",
    href: "/trader/positions",
    icon: Wallet,
    roles: userPanelRoles,
    featureFlag: features.trader.positions,
  },
];

export const traderBottomNav = {
  tabs: [
    { key: "dashboard", labelFa: "خانه", href: "/trader/dashboard", icon: LayoutDashboard },
    { key: "remittances", labelFa: "ثبت درخواست", href: "/trader/remittances", icon: Receipt },
    { key: "payer", labelFa: "پرداخت‌ها", href: "/trader/transactions?type=withdraw", icon: Banknote },
    { key: "receiver", labelFa: "دریافت‌ها", href: "/trader/transactions?type=deposit", icon: ScrollText },
    { key: "more", labelFa: "بیشتر", href: "#more", icon: MoreHorizontal },
  ],
  moreItems: [
    {
      key: "customers",
      labelFa: "مقصدها",
      href: "/trader/customers",
      icon: MapPinned,
      featureFlag: features.trader.customers,
    },
    {
      key: "history",
      labelFa: "تاریخچه",
      href: "/trader/transactions",
      icon: History,
      featureFlag: features.trader.transactions,
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
  { key: "users", labelFa: "کاربران", href: "/admin/users", icon: Users, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "instruments", labelFa: "ابزارها", href: "/admin/instruments", icon: Tags, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "pricing", labelFa: "قیمت‌گذاری", href: "/admin/pricing", icon: NotepadText, roles: [UserRole.ADMIN], featureFlag: true },
  { key: "pricing-logs", labelFa: "گزارش قیمت", href: "/admin/pricing/logs", icon: Activity, roles: [UserRole.ADMIN], featureFlag: true },
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
