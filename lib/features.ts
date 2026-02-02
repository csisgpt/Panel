export const features = {
  trader: {
    transactions: true,
    remittances: true,
    customers: false,
    settlement: false,
    prices: false,
    positions: false,
    p2p: true,
    destinations: true,
    requests: true,
  },
  admin: {
    tahesab: false,
    risk: false,
    files: false,
    settings: false,
    p2p: true,
  },
};

export type FeatureKey = keyof typeof features;
