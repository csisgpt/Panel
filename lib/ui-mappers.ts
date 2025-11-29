import { BadgeProps } from "@/components/ui/badge";
import {
  DepositStatus,
  TradeStatus,
  UserStatus,
  WithdrawStatus,
} from "@/lib/types/backend";

export type BadgeVariant = BadgeProps["variant"];

export function mapUserStatus(status: UserStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case UserStatus.ACTIVE:
      return { label: "فعال", variant: "success" };
    case UserStatus.BLOCKED:
      return { label: "مسدود", variant: "destructive" };
    case UserStatus.PENDING_APPROVAL:
    default:
      return { label: "در انتظار تایید", variant: "warning" };
  }
}

export function mapDepositStatus(status: DepositStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case DepositStatus.APPROVED:
      return { label: "تایید شده", variant: "success" };
    case DepositStatus.REJECTED:
      return { label: "رد شده", variant: "destructive" };
    case DepositStatus.PENDING:
    default:
      return { label: "در انتظار", variant: "secondary" };
  }
}

export function mapWithdrawStatus(status: WithdrawStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case WithdrawStatus.APPROVED:
      return { label: "تایید شده", variant: "success" };
    case WithdrawStatus.REJECTED:
      return { label: "رد شده", variant: "destructive" };
    case WithdrawStatus.PENDING:
    default:
      return { label: "در انتظار", variant: "secondary" };
  }
}

export function mapTradeStatus(status: TradeStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case TradeStatus.APPROVED:
      return { label: "تایید شده", variant: "success" };
    case TradeStatus.REJECTED:
    case TradeStatus.CANCELLED_BY_ADMIN:
    case TradeStatus.CANCELLED_BY_USER:
      return { label: "لغو/رد شده", variant: "destructive" };
    case TradeStatus.SETTLED:
      return { label: "تسویه شده", variant: "secondary" };
    case TradeStatus.PENDING:
    default:
      return { label: "در انتظار", variant: "warning" };
  }
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export function mapRiskLevel(level: RiskLevel): { label: string; variant: BadgeVariant } {
  switch (level) {
    case "LOW":
      return { label: "کم", variant: "success" };
    case "MEDIUM":
      return { label: "متوسط", variant: "warning" };
    case "HIGH":
    default:
      return { label: "پرریسک", variant: "destructive" };
  }
}
