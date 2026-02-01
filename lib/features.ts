export const features = {
  trader: {
    transactions: true,
    remittances: true,
    customers: false,
    settlement: false,
    prices: false,
    positions: false,
  },
  admin: {
    tahesab: false,
    risk: false,
    files: false,
    settings: false,
  },
};

export type FeatureKey = keyof typeof features;
