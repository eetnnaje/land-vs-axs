import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ExchangeRates, LandsGrid, LandsItem } from './diff.interface';
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
    'f2c',
    'f6c',
    'f19c',
    'f14c',
    'f10c',
    'p4',
    'f17c',
    'f12c',
    'f20c',
    'f9c',
    'f11c',
  ];
  cheapestItems!: LandsItem[];
  totalItemsPrice!: { [key: string]: number };

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
      this.cheapestItems = landItems;
      this.cheapestItems.forEach((item) => {
        const [first] = item.data.items.results;
        this.totalItemsPrice = {
          eth: +first.auction.currentPrice,
          usd: +first.auction.currentPriceUSD,
        };
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
}
