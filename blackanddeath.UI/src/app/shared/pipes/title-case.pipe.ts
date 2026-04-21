import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'titleCaseAll', standalone: true })
export class TitleCaseAllPipe implements PipeTransform {
  transform(value: string | null | undefined, firstOnly = false): string {
    if (!value) return '';
    if (firstOnly) {
      return value.replace(/^(\W*)(\w)/, (_, pre, letter) => pre + letter.toUpperCase());
    }
    return value.replace(/\S+/g, word => {
      const idx = word.search(/\w/);
      if (idx === -1) return word;
      return word.slice(0, idx) + word[idx].toUpperCase() + word.slice(idx + 1).toLowerCase();
    });
  }
}
