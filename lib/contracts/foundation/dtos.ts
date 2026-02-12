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
  instrumentCode: string;
  instrumentName?: string;
  balance: string;
  blockedBalance?: string;
  availableBalance?: string;
}

export interface WalletSummary {
  balancesHiddenByUserSetting?: boolean;
  balancesForAdmin?: Array<{ instrumentCode: string; amount: string }>;
}

export interface EffectiveSettings {
  showBalances: boolean;
  showGold: boolean;
  showCoins: boolean;
  showCash: boolean;
  tradeEnabled: boolean;
  withdrawEnabled: boolean;
  maxOpenTrades: number;
  metaJson?: unknown;
}

export interface EffectiveSettingsWithSources {
  effective: EffectiveSettings;
  sources: Record<string, "USER" | "GROUP" | "DEFAULT">;
}

export interface PolicySummaryItem {
  effectiveValue: string | null;
  source: string;
  selectedRuleId?: string | null;
  selectorUsed?: string | null;
  kycRequiredLevel?: KycLevel | null;
}

export interface PolicySummary {
  [key: string]: PolicySummaryItem | undefined;
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

export interface PolicyRuleDto {
  id: string;
  scopeType: PolicyScopeType;
  scopeUserId: string | null;
  scopeGroupId: string | null;
  selectorType: "ALL" | "PRODUCT" | "INSTRUMENT" | "TYPE";
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
