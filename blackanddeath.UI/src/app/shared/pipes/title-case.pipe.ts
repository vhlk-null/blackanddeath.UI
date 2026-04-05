import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'titleCaseAll', standalone: true })
export class TitleCaseAllPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/\S+/g, word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  }
}
