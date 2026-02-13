export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ListResult<T> {
  items: T[];
  meta?: PaginationMeta;
}

export interface UserSafeDto {
  id: string;
  fullName: string;
  mobile: string;
  email?: string | null;
  role: string;
  status: string;
  createdAt?: string;
  customerGroupId?: string | null;
  customerGroupName?: string | null;
  customerGroupCode?: string | null;
  tahesabCustomerCode?: string | null;
  nationalCode?: string | null;
  address?: string | null;
}

export interface CustomerGroupDto {
  id: string;
  code: string;
  name: string;
  isDefault?: boolean;
  tahesabGroupName?: string | null;
  usersCount?: number;
}

export interface UserKycDto {
  status: string;
  level?: string | null;
  rejectReason?: string | null;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  submittedAt?: string | null;
}

export interface EffectiveSettingsDto {
  showBalances?: boolean;
  showGold?: boolean;
  showCoins?: boolean;
  showCash?: boolean;
  tradeEnabled?: boolean;
  withdrawEnabled?: boolean;
  maxOpenTrades?: number | null;
}

export interface EffectiveSettingsSourcesDto {
  showBalances?: string;
  tradeEnabled?: string;
  withdrawEnabled?: string;
  maxOpenTrades?: string;
}

export interface WalletAccountDto {
  id?: string;
  instrumentCode: string;
  instrumentName?: string;
  balance: string;
  blockedBalance?: string;
  availableBalance?: string;
}

export interface WalletSummaryDto {
  balancesHiddenByUserSetting?: boolean;
  balancesForAdmin?: Array<{ instrumentCode: string; amount: string }>;
}

export interface PolicyMetricSummaryDto {
  limit?: string | null;
  kycRequiredLevel?: string | null;
  source?: string | null;
}

export interface PolicySummaryDto {
  withdrawDaily?: PolicyMetricSummaryDto;
  withdrawMonthly?: PolicyMetricSummaryDto;
  tradeBuyDaily?: PolicyMetricSummaryDto;
  tradeSellDaily?: PolicyMetricSummaryDto;
  tradeBuyMonthly?: PolicyMetricSummaryDto;
  tradeSellMonthly?: PolicyMetricSummaryDto;
}

export interface PolicyRuleDto {
  id: string;
  scopeType: "GLOBAL" | "GROUP" | "USER";
  scopeUserId?: string | null;
  scopeGroupId?: string | null;
  action: string;
  metric: string;
  period: string;
  instrumentId?: string | null;
  productId?: string | null;
  instrumentType?: string | null;
  limit: string;
  minKycLevel?: string | null;
  enabled: boolean;
  priority?: number | null;
  note?: string | null;
  updatedAt?: string;
}

export interface TahesabOutboxDto {
  id: string;
  status: string;
  method?: string;
  correlationId?: string | null;
  triesCount?: number;
  nextRetryAt?: string | null;
  lastError?: string | null;
  createdAt?: string;
}

export interface AdminUserOverviewDto {
  user: UserSafeDto;
  group?: CustomerGroupDto | null;
  kyc?: UserKycDto | null;
  settings?: {
    raw?: EffectiveSettingsDto;
    effective?: EffectiveSettingsDto;
    sources?: EffectiveSettingsSourcesDto;
  };
  wallet?: {
    accounts?: WalletAccountDto[];
    summary?: WalletSummaryDto;
  };
  policySummary?: PolicySummaryDto;
  tahesab?: {
    enabled?: boolean;
    customerCode?: string | null;
    groupName?: string | null;
    lastOutbox?: TahesabOutboxDto | null;
  };
}
