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

export interface LandsGrid {
  data: {
    lands: {
      total: number;
      results: [
        {
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
      ];
      __typename: string;
    };
  };
}
