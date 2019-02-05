import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abrev'
})
export class AbrevPipe implements PipeTransform {

  transform(value: string, n: number = 5): string {
    return value.substring(0, n) + '...';
  }

}
