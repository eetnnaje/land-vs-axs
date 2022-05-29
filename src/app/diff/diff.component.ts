import { Component, OnInit } from '@angular/core';
import { forkJoin, from, Observable } from 'rxjs';
import {
  ExchangeRates,
  ItemDetail,
  LandItem,
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
  cheapestItems: ItemDetail[] = [];
  excludeItemAliases: string[] = [
    'f1c', // Gilded Lamp: Increases Bird Axie Morale by 15% when battling Chimera.
    'f2c', // Flower of Life: Increases all Axie Healing effects by 7% when battling Chimera.
    'f3c', // Purple Lavender: Increases Bug class Axie attacking abilities by 15% when battling Chimera.
    'f4c', // Ancient Pillar: Increases Plant class Axie HP by 15% when battling Chimera.
    'f5c', // Voluptuous grapes: Bird and Aquatic Axie start with 3 turns of "Magic Shield" buff active when battling Chimera.
    'f6c', // Spring Shrub: Increases Axie HP by 7% when battling Chimera.
    'f7c', // Gold Wild Flower: Increases Bug Axie defensive abilities by 15% when battling Chimera.
    'f8c', // Basket of Strawberries: Plant and Reptil Axie start with 3 turns of "Magic Shield" buff active when battling Chimera.
    'f9c', // Intact ruin: Increases Axie defensive abiilties by 15% when battling Chimera on Forest Land.
    'f10c', // Wise Bamboo: Increases Axie attacking abilities by 15% when battling Chimera on Forest Land.
    'f13c', // Crimson Leaves: Increases Plant Axie HP by 15% when battling Chimera.
    'f15c', // Gourd Vines: Beast and Bug Axie start with 3 turn of "Magic Shield" buff active when battling Chimera.
    'f16c', // Crimson Serpent: Increases Reptile Axie HP by 15% when battling Chimera.
    'f18c', //  Golden Cheeked Warbler Nest: Increases Bird Axie defensive abilities by 15% when battling Chimera.
    'f19c', // Lavender Hydrangea: Increases Axie Speed by 15% when battling Chimera on Forest land.
    'p2', // Ganbaru CrypTon: Increases Bird Axie speed by 15% when battling Chimera.
    'p3b', // MakerDao Silver: Axies have a 2% greater chance to spill LUNA when traveling over land this item is placed on.
  ];
  totalItemsPrice: { [key: string]: number } = { eth: 0, usd: 0 };
  currentTimestamp = new Date().getTime() / 1000;
  specificItemAliases: string[] = [
    'lny5', // Crimson Tiger: This item has no effect.
    'p5', // Aave Phantom Altar: Increase Axie map travel speed by 2%.
  ];

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

    // All Land Items
    this.diffService.getAllItems().subscribe((result) => {
      const total = result.data.items.total;
      const maxLength = 100;
      const pagination = Math.ceil(total / maxLength);

      forkJoin(
        Array(pagination)
          .fill(0)
          .map((_, i) => {
            const from = i === 0 ? 0 : i * maxLength + 1;
            const size = i === 0 ? maxLength : i * maxLength + maxLength;
            return this.diffService.getAllItems(from, size);
          })
      ).subscribe((results) => {
        let items: LandItem[] = [];

        results.forEach((result) => {
          items = [...items, ...result.data.items.results];
        });

        const itemAliases = [...new Set(items.map((item) => item.itemAlias))];
        const filteredItemAlises = itemAliases.filter(
          (itemAlias) => !this.excludeItemAliases.includes(itemAlias)
        );

        // Land Item
        forkJoin([
          ...filteredItemAlises.map((itemAlias) =>
            this.diffService.getCheapestItem(itemAlias)
          ),
          ...this.specificItemAliases.map((itemAlias) =>
            this.diffService.getCheapestItem(itemAlias, 'forest', 'rare')
          ),
        ]).subscribe((landItems) => {
          landItems.forEach((item) => {
            const [first] = item.data.items.results;
            this.diffService
              .getItemDetails(first.itemAlias, first.itemId)
              .subscribe((itemDetail) => {
                this.cheapestItems.push(itemDetail);
                this.cheapestItems = this.cheapestItems.sort(
                  (a, b) =>
                    +a.data.item.auction.endingPrice -
                    +b.data.item.auction.endingPrice
                );
              });

            this.totalItemsPrice['eth'] += +first.auction.endingPrice;

            this.diffService.getExchangeRates().subscribe((exchangeRates) => {
              this.totalItemsPrice['usd'] +=
                (+first.auction.endingPrice / 1e18) *
                exchangeRates.data.exchangeRate.eth.usd;
            });
          });
        });
      });
    });
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

  getCompoundingReward(
    value: number,
    apr: number = this.apr,
    days = 365
  ): number {
    let n = value;
    Array(days)
      .fill(0)
      .forEach(() => (n += this.getDailyReward(n, apr, days)));
    return n;
  }

  getFixedCompoundingReward(
    value: number,
    reward: number,
    apr: number = this.apr,
    days = 365
  ): number {
    let n = value;
    Array(days)
      .fill(0)
      .forEach(() => (n += this.getDailyReward(n, apr, days) + reward));
    return n;
  }

  getItemDetail(itemAlias: string, itemId: number): Observable<ItemDetail> {
    return this.diffService.getItemDetails(itemAlias, itemId);
  }

  readableDate(timestamp: number): string {
    const lang = 'en-US';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour12: true,
    } as const;
    return new Date(timestamp * 1000).toLocaleTimeString(lang, options);
  }

  hex2ronin(address: string): string {
    const [first, last] = address.split('0x');
    return `ronin:${last}`;
  }

  getName(name: string): string {
    return name.trim() || 'Lunacian';
  }
}
