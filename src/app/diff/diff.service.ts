import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExchangeRates } from './diff.interface';

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
}
