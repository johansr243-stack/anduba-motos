import { Pipe } from '@angular/core';

@Pipe({
  name: 'mongoDate',
})
export class MongoDatePipe {
  transform(value: string | Date): string {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const ordinal = this.getOrdinalSuffix(day);

    return `${month} ${day}${ordinal} ${year}`;
  }

  private getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th'; // cubre 11th, 12th, 13th también
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}