import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ExchangeRates, LandsGrid } from './diff.interface';
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
  apr = 63.98; // 100%

  constructor(private diffService: DiffService) {}

  ngOnInit(): void {
    // Exchange Rates
    this.diffService
      .getExchangeRates()
      .subscribe((exchangeRates) => (this.exchangeRates = exchangeRates));

    // Land Plots
    forkJoin(
      this.landTypes.map((landType) =>
        this.diffService.getCheapestLand(landType)
      )
    ).subscribe((landGrids) => (this.cheapestPlots = landGrids));
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
