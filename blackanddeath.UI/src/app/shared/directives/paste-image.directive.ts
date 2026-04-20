import { Directive, output, HostListener, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appPasteImage]',
  standalone: true,
  host: { tabindex: '0' },
})
export class PasteImageDirective {
  imagePasted = output<File>();
  private el = inject(ElementRef);

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    this.handleClipboard(event.clipboardData);
  }

  @HostListener('document:paste', ['$event'])
  onDocPaste(event: ClipboardEvent): void {
    if (!this.el.nativeElement.contains(document.activeElement) &&
        document.activeElement !== this.el.nativeElement) return;
    this.handleClipboard(event.clipboardData);
  }

  private handleClipboard(data: DataTransfer | null): void {
    if (!data) return;
    for (let i = 0; i < data.items.length; i++) {
      if (data.items[i].type.startsWith('image/')) {
        const file = data.items[i].getAsFile();
        if (file) { this.imagePasted.emit(file); return; }
      }
    }
  }
}
