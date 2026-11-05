import { CurrencyPipe } from '@angular/common';
import { Component, Input} from '@angular/core';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-product-home-card',
  imports: [CurrencyPipe, ImageUrlPipe],
  templateUrl: './product-home-card.html',
  styleUrl: './product-home-card.css',
})
export class ProductHomeCard {

  @Input() product:any

} 
