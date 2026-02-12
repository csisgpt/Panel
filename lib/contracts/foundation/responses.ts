import type { CustomerGroup, EffectiveSettingsWithSources, PolicySummary, TahesabOutbox, UserKyc, UserSafeDto, WalletAccountDto, WalletSummary } from "./dtos";
import type { KycLevel } from "./enums";

export interface MeOverviewResponse {
  user: UserSafeDto & { customerGroup: { id: string; code: string; name: string } | null };
  kyc: UserKyc | null;
  settings: EffectiveSettingsWithSources;
  wallet: { accounts: WalletAccountDto[]; summary: WalletSummary };
  policy: { summary: PolicySummary };
  capabilities: { canTrade?: boolean; canWithdraw?: boolean; reasons?: Array<{ code: string; message: string; meta?: Record<string, unknown> }> };
}

export interface AdminUserOverviewResponse {
  user: UserSafeDto;
  customerGroup: { id: string; code: string; name: string; tahesabGroupName: string | null } | null;
  kyc: { status: string; level: string; verifiedAt: string | null; rejectedAt: string | null; rejectReason: string | null } | null;
  settings: EffectiveSettingsWithSources;
  wallet: { accounts: WalletAccountDto[]; summary: WalletSummary };
  policy: { summary: PolicySummary };
  tahesab: {
    enabled: boolean;
    customerCode: string | null;
    groupName: string | null;
    lastOutbox: TahesabOutbox | null;
    outboxHistory?: TahesabOutbox[];
  };
}

export interface EffectivePolicyTraceResponse {
  context: { userId: string; customerGroupId: string | null; kycLevel: KycLevel | null };
  ruleGroups: Array<{ action: string; metric: string; period: string; selected: unknown; candidates: unknown[]; kycRequiredLevel: KycLevel | null }>;
}
