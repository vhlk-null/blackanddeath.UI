import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'titleCaseAll', standalone: true })
export class TitleCaseAllPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/\S+/g, word =>
      word.replace(/^(\W*)(\w)/, (_, pre, letter) => pre + letter.toUpperCase()) +
      word.slice(word.search(/\w/) + 1).toLowerCase()
    );
  }
}
