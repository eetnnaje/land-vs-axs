import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import {
  ExchangeRates,
  ItemDetail,
  LandsGrid,
  LandsItem,
} from './diff.interface';
import { DiffService } from './diff.service';

@Component({
  selector: 'app-diff',
  templateUrl: './diff.component.html',
  styleUrls: ['./diff.component.scss'],
})
export class DiffComponent implements OnInit {
  exchangeRates!: ExchangeRates;
  landTypes: string[] = ['savannah', 'forest', 'arctic', 'mystic', 'genesis'];
  cheapestPlots!: LandsGrid[];
  stakingRewards: { [key: string]: number } = {
    savannah: 0.08,
    forest: 0.26,
    arctic: 0.74,
    mystic: 1.64,
    genesis: 32.7,
  };
  apr: number = 82; // 63.98; // => 100% APY
  itemAliases: string[] = [
    'p4', // 2% Less Time (Harvesting)
    'f11c', // 15% SPD (Wood Chopping)
    'f12c', // 15% Less Time (Egg Hatching)
    'f20c', // 50% MISS (Chimera)
    'f14c', // 15% EXP
    'f17c', // 15% Stealth
    'f6c', // 7% HP
    'f2c', // 7% Heal
    'f19c', // 15% SPD
    'f10c', // %15% ATK
    'f9c', // 15% DEF
  ];
  cheapestItems: ItemDetail[] = [];
  totalItemsPrice: { [key: string]: number } = { eth: 0, usd: 0 };

  constructor(private diffService: DiffService) {}

  ngOnInit(): void {
    // Exchange Rates
    this.diffService
      .getExchangeRates()
      .subscribe((exchangeRates) => (this.exchangeRates = exchangeRates));

    // Land Plots
    forkJoin(
      this.landTypes.map((landType) =>
        this.diffService.getCheapestPlot(landType)
      )
    ).subscribe((landGrids) => (this.cheapestPlots = landGrids));

    // Land Item
    forkJoin(
      this.itemAliases.map((itemAlias) =>
        this.diffService.getCheapestItem(itemAlias)
      )
    ).subscribe((landItems) => {
      landItems.forEach((item) => {
        const [first] = item.data.items.results;
        this.diffService
          .getItemDetails(first.itemAlias, first.itemId)
          .subscribe((itemDetail) => {
            this.cheapestItems.push(itemDetail);
          });

        this.totalItemsPrice['eth'] += +first.auction.currentPrice;
        this.totalItemsPrice['usd'] += +first.auction.currentPriceUSD;
      });
    });
  }

  getCompoundingReward(
    value: number,
    reward: number,
    apr: number = this.apr,
    days: number = 365
  ): number {
    let n = value;
    Array(days)
      .fill(0)
      .forEach((day) => {
        n += (apr / 100 / days) * n + reward;
      });
    return n;
  }

  onAprKeyUp(value: string): void {
    this.apr = +value;
  }

  getDailyReward(
    value: number,
    apr: number = this.apr,
    days: number = 365
  ): number {
    return (apr / 100 / days) * value;
  }

  getItemDetail(itemAlias: string, itemId: number): Observable<ItemDetail> {
    return this.diffService.getItemDetails(itemAlias, itemId);
  }
}
