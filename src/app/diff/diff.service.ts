import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ExchangeRates,
  ItemDetail,
  LandsGrid,
  LandsItem,
} from './diff.interface';

const GetItemBriefListQuery = `
  query GetItemBriefList(
    $from: Int
    $size: Int
    $sort: SortBy
    $auctionType: AuctionType
    $owner: String
    $criteria: ItemSearchCriteria
    $filterStuckAuctions: Boolean
  ) {
    items(
      from: $from
      size: $size
      sort: $sort
      auctionType: $auctionType
      owner: $owner
      criteria: $criteria
      filterStuckAuctions: $filterStuckAuctions
    ) {
      total
      results {
        ...ItemBrief
        __typename
      }
      __typename
    }
  }
  fragment ItemBrief on LandItem {
    itemId
    tokenType
    tokenId
    itemId
    landType
    name
    itemAlias
    rarity
    figureURL
    auction {
      ...AxieAuction
      __typename
    }
    __typename
  }
  fragment AxieAuction on Auction {
    startingPrice
    endingPrice
    startingTimestamp
    endingTimestamp
    duration
    timeLeft
    currentPrice
    currentPriceUSD
    suggestedPrice
    seller
    listingIndex
    state
    __typename
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DiffService {
  constructor(private http: HttpClient) {}

  getExchangeRates(): Observable<ExchangeRates> {
    const url = 'https://graphql-gateway.axieinfinity.com/graphql';
    const data = {
      operationName: 'NewEthExchangeRate',
      variables: {},
      query: `
        query NewEthExchangeRate {
          exchangeRate {
            eth {
              usd
              __typename
            }
            slp {
              usd
              __typename
            }
            ron {
              usd
              __typename
            }
            axs {
              usd
              __typename
            } usd {
              usd
              __typename
            }
            __typename
          }
        }
      `,
    };
    return this.http.post<ExchangeRates>(url, data);
  }

  getCheapestPlot(landType: string): Observable<LandsGrid> {
    const url = 'https://graphql-gateway.axieinfinity.com/graphql';
    landType = `${landType[0].toUpperCase()}${landType.substring(1)}`;
    const data = {
      operationName: 'GetLandsGrid',
      variables: {
        from: 0,
        size: 1,
        sort: 'PriceAsc',
        auctionType: 'Sale',
        owner: null,
        criteria: { landType: [landType] },
        filterStuckAuctions: false,
      },
      query: `
        query GetLandsGrid(
          $from: Int!
          $size: Int!
          $sort: SortBy!
          $owner: String
          $criteria: LandSearchCriteria
          $auctionType: AuctionType
          $filterStuckAuctions: Boolean
        ) {
          lands(
            criteria: $criteria
            from: $from
            size: $size
            sort: $sort
            owner: $owner
            auctionType: $auctionType
            filterStuckAuctions: $filterStuckAuctions
          ) {
            total
            results {
              ...LandBriefV2
              __typename
            }
            __typename
          }
        }

        fragment LandBriefV2 on LandPlot {
          tokenId
          owner
          landType
          row
          col
          auction {
            currentPrice
            startingTimestamp
            currentPriceUSD
            __typename
          }
          ownerProfile {
            name
            __typename
          }
          __typename
        }
      `,
    };
    return this.http.post<LandsGrid>(url, data);
  }

  getAllItems(
    from: number = 0,
    size: number = 20,
    landType: string = 'forest',
    rarity: string = 'epic'
  ): Observable<LandsItem> {
    const url = 'https://graphql-gateway.axieinfinity.com/graphql';
    landType = `${landType[0].toUpperCase()}${landType.substring(1)}`;
    rarity = `${rarity[0].toUpperCase()}${rarity.substring(1)}`;
    const data = {
      operationName: 'GetItemBriefList',
      variables: {
        from,
        size,
        sort: 'PriceAsc',
        owner: null,
        auctionType: 'Sale',
        criteria: {
          landType: [landType],
          rarity: [rarity],
          itemAlias: [],
        },
        filterStuckAuctions: false,
      },
      query: GetItemBriefListQuery,
    };
    return this.http.post<LandsItem>(url, data);
  }

  getCheapestItem(
    itemAlias: string,
    landType: string = 'forest',
    rarity: string = 'epic'
  ): Observable<LandsItem> {
    const url = 'https://graphql-gateway.axieinfinity.com/graphql';
    landType = `${landType[0].toUpperCase()}${landType.substring(1)}`;
    rarity = `${rarity[0].toUpperCase()}${rarity.substring(1)}`;
    const data = {
      operationName: 'GetItemBriefList',
      variables: {
        from: 0,
        size: 1,
        sort: 'PriceAsc',
        owner: null,
        auctionType: 'Sale',
        criteria: {
          landType: [landType],
          rarity: [rarity],
          itemAlias: [itemAlias],
        },
        filterStuckAuctions: false,
      },
      query: GetItemBriefListQuery,
    };
    return this.http.post<LandsItem>(url, data);
  }

  getItemDetails(itemAlias: string, itemId: number): Observable<ItemDetail> {
    const url = 'https://graphql-gateway.axieinfinity.com/graphql';
    const data = {
      operationName: 'GetItemDetail',
      variables: {
        itemAlias: itemAlias,
        itemId: itemId,
      },
      query: `
        query GetItemDetail($itemAlias: String!, $itemId: Int!) {
          item(itemAlias: $itemAlias, itemId: $itemId) {
            ...ItemDetail
            __typename
          }
        }
        fragment ItemDetail on LandItem {
          itemId
          tokenId
          tokenType
          itemId
          landType
          name
          itemAlias
          description
          rarity
          effects
          figureURL
          owner
          auction {
            ...AxieAuction
            __typename
          }
          ownerProfile {
            name
            __typename
          }
          __typename
        }
        fragment AxieAuction on Auction {
          startingPrice
          endingPrice
          startingTimestamp
          endingTimestamp
          duration
          timeLeft
          currentPrice
          currentPriceUSD
          suggestedPrice
          seller
          listingIndex
          state
          __typename
        }
      `,
    };
    return this.http.post<ItemDetail>(url, data);
  }
}
