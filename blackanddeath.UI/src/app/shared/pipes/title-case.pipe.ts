import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'titleCaseAll', standalone: true })
export class TitleCaseAllPipe implements PipeTransform {
  transform(value: string | null | undefined, firstOnly = false): string {
    if (!value) return '';
    if (firstOnly) {
      return value.replace(/^(\W*)(\w)/, (_, pre, letter) => pre + letter.toUpperCase());
    }
    return value.replace(/\S+/g, word =>
      word.replace(/^(\W*)(\w)/, (_, pre, letter) => pre + letter.toUpperCase()) +
      word.slice(word.search(/\w/) + 1).toLowerCase()
    );
  }
}
