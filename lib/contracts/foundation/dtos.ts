import type { KycLevel, KycStatus, PolicyAction, PolicyMetric, PolicyPeriod, PolicyScopeType, UserRole, UserStatus } from "./enums";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface UserSettingsDto {
  showBalances?: boolean;
  showGold?: boolean;
  showCoins?: boolean;
  showCash?: boolean;
  tradeEnabled?: boolean;
  withdrawEnabled?: boolean;
  maxOpenTrades?: number | null;
  metaJson?: Record<string, unknown> | null;
}

export interface UserSafeDto {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  customerGroupId: string | null;
  tahesabCustomerCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserKyc {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: KycStatus;
  level: KycLevel;
  verifiedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
}

export interface WalletAccountDto {
  id: string;
  userId: string;
  instrument: { id: string; code: string; name: string; type: string };
  balance: string | null;
  blockedBalance: string | null;
  minBalance: string | null;
  availableBalance: string | null;
  balancesHidden: boolean;
}

export interface WalletSummary {
  balancesHiddenByUserSetting: boolean;
  irrAvailable: string | null;
}

export interface EffectiveSettings {
  showBalances: boolean;
  showGold: boolean;
  showCoins: boolean;
  showCash: boolean;
  tradeEnabled: boolean;
  withdrawEnabled: boolean;
  maxOpenTrades: number | null;
  metaJson: Record<string, unknown> | null;
}

export interface EffectiveSettingsWithSources {
  effective: EffectiveSettings;
  sources: {
    showBalances: "USER" | "GROUP" | "DEFAULT";
    showGold: "USER" | "GROUP" | "DEFAULT";
    showCoins: "USER" | "GROUP" | "DEFAULT";
    showCash: "USER" | "GROUP" | "DEFAULT";
    tradeEnabled: "USER" | "GROUP" | "DEFAULT";
    withdrawEnabled: "USER" | "GROUP" | "DEFAULT";
    maxOpenTrades: "USER" | "GROUP" | "DEFAULT";
    metaJson: "GROUP" | "DEFAULT";
  };
}

export interface PolicySummaryItem {
  limit: string | null;
  kycRequiredLevel: KycLevel | null;
  ruleId: string | null;
  source: PolicyScopeType | "NONE";
}

export interface PolicySummary {
  withdrawIrr: { daily: PolicySummaryItem; monthly: PolicySummaryItem };
  tradeBuyNotionalIrr: { daily: PolicySummaryItem; monthly: PolicySummaryItem };
  tradeSellNotionalIrr: { daily: PolicySummaryItem; monthly: PolicySummaryItem };
  withdraw: { daily: PolicySummaryItem; monthly: PolicySummaryItem };
  tradeBuy: { daily: PolicySummaryItem; monthly: PolicySummaryItem };
  tradeSell: { daily: PolicySummaryItem; monthly: PolicySummaryItem };
}

export interface CustomerGroup {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  tahesabGroupName: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupUserRowDto extends UserSafeDto {
  customerGroup: { id: string; code: string; name: string; tahesabGroupName: string | null } | null;
  kyc: { status: KycStatus; level: KycLevel } | null;
}

export interface PolicyRuleDto {
  id: string;
  scopeType: PolicyScopeType;
  scopeUserId: string | null;
  scopeGroupId: string | null;
  productId: string | null;
  instrumentId: string | null;
  instrumentType: string | null;
  action: PolicyAction;
  metric: PolicyMetric;
  period: PolicyPeriod;
  limit: string;
  minKycLevel: KycLevel | null;
  enabled: boolean;
  priority: number;
  note: string | null;
  updatedAt: string;
}

export interface TahesabOutbox {
  id: string;
  status: string;
  method: string;
  correlationId: string | null;
  triesCount: number;
  nextRetryAt: string | null;
  lastError: string | null;
  createdAt: string;
}
