export type UserRole = "ADMIN" | "TRADER" | "CLIENT";
export type UserStatus = "ACTIVE" | "BLOCKED" | "PENDING_APPROVAL";
export type KycStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
export type KycLevel = "NONE" | "BASIC" | "FULL";
export type PolicyScopeType = "GLOBAL" | "GROUP" | "USER";
export type PolicyAction =
  | "WITHDRAW_IRR"
  | "DEPOSIT_IRR"
  | "TRADE_BUY"
  | "TRADE_SELL"
  | "REMITTANCE_SEND"
  | "CUSTODY_IN"
  | "CUSTODY_OUT";
export type PolicyMetric = "NOTIONAL_IRR" | "WEIGHT_750_G" | "COUNT";
export type PolicyPeriod = "DAILY" | "MONTHLY";
export type TahesabOutboxStatus = "PENDING" | "SUCCESS" | "FAILED";
