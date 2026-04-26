import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, forwardRef, HostListener, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';

@Component({
  selector: 'app-rich-editor',
  templateUrl: './rich-editor.html',
  styleUrl: './rich-editor.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RichEditor), multi: true }],
})
export class RichEditor implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder = 'Write something…';
  @Input() collapsible = false;
  @Input() compact = false;
  @Output() contentChange = new EventEmitter<string>();

  showToolbar = true;

  @HostListener('focusin')
  onFocusIn(): void {
    if (this.collapsible) this.showToolbar = true;
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(e: FocusEvent): void {
    if (this.collapsible && !this.editorEl.nativeElement.closest('.rich-editor')?.contains(e.relatedTarget as Node)) {
      this.showToolbar = false;
    }
  }
  @ViewChild('editorEl', { static: true }) editorEl!: ElementRef<HTMLElement>;

  editor!: Editor;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.collapsible) this.showToolbar = false;
    this.editor = new Editor({
      element: this.editorEl.nativeElement,
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Link.configure({ openOnClick: false }),
        History,
        Placeholder.configure({ placeholder: this.placeholder }),
      ],
      editorProps: {
        attributes: { class: 'rich-editor__content' },
      },
      onUpdate: ({ editor }) => {
        this.onChange(editor.getHTML());
        this.onTouched();
      },
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  writeValue(value: string): void {
    if (this.editor && value !== this.editor.getHTML()) {
      this.editor.commands.setContent(value ?? '');
    }
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  toggleBold(): void { this.editor.chain().focus().toggleBold().run(); }
  toggleItalic(): void { this.editor.chain().focus().toggleItalic().run(); }
  undo(): void { this.editor.chain().focus().undo().run(); }
  redo(): void { this.editor.chain().focus().redo().run(); }

  isEmpty(): boolean {
    return this.editor?.isEmpty ?? true;
  }

  getHTML(): string {
    return this.editor?.getHTML() ?? '';
  }

  clear(): void {
    this.editor?.commands.clearContent();
  }

  isBold(): boolean { return this.editor?.isActive('bold') ?? false; }
  isItalic(): boolean { return this.editor?.isActive('italic') ?? false; }
  canUndo(): boolean { return this.editor?.can().undo() ?? false; }
  canRedo(): boolean { return this.editor?.can().redo() ?? false; }
}
