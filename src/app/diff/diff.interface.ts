export interface Diff {}

export interface ExchangeRates {
  data: {
    exchangeRate: {
      eth: {
        usd: number;
        __typename: string;
      };
      slp: {
        usd: number;
        __typename: string;
      };
      ron: {
        usd: number;
        __typename: string;
      };
      axs: {
        usd: number;
        __typename: string;
      };
      usd: {
        usd: number;
        __typename: string;
      };
      __typename: string;
    };
  };
}

export interface LandGrid {
  tokenId: string;
  owner: string;
  landType: string;
  row: number;
  col: number;
  auction: {
    currentPrice: string;
    startingTimestamp: string;
    currentPriceUSD: string;
    __typename: string;
  };
  ownerProfile: {
    name: string;
    __typename: string;
  };
  __typename: string;
}

export interface LandsGrid {
  data: {
    lands: {
      total: number;
      results: LandGrid[];
      __typename: string;
    };
  };
}

export interface LandItem {
  itemId: number;
  tokenType: number;
  tokenId: string;
  landType: string;
  name: string;
  itemAlias: string;
  rarity: string;
  figureURL: string;
  auction: {
    startingPrice: string;
    endingPrice: string;
    startingTimestamp: string;
    endingTimestamp: string;
    duration: string;
    timeLeft: string;
    currentPrice: string;
    currentPriceUSD: string;
    suggestedPrice: string;
    seller: string;
    listingIndex: number;
    state: string;
    __typename: string;
  };
  __typename: string;
}

export interface LandsItem {
  data: {
    items: {
      total: number;
      results: LandItem[];
      __typename: string;
    };
  };
}
