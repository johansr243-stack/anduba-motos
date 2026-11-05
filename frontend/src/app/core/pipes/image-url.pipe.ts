import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';


@Pipe({ name: 'imageUrl', standalone: true })
export class ImageUrlPipe implements PipeTransform {
  transform(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path; 
    }
    return `${environment.filesUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}