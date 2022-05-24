import { Component, OnInit } from '@angular/core';
import { ExchangeRates } from './diff.interface';
import { DiffService } from './diff.service';

@Component({
  selector: 'app-diff',
  templateUrl: './diff.component.html',
  styleUrls: ['./diff.component.scss'],
})
export class DiffComponent implements OnInit {
  exchangeRates!: ExchangeRates;

  constructor(private diffService: DiffService) {}

  ngOnInit(): void {
    this.diffService
      .getExchangeRates()
      .subscribe((exchangeRates) => (this.exchangeRates = exchangeRates));
  }
}
