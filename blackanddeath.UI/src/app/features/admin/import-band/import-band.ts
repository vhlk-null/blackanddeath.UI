import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImportService } from '../../services/import.service';

@Component({
  selector: 'app-import-band',
  imports: [FormsModule],
  templateUrl: './import-band.html',
  styleUrl: './import-band.scss',
})
export class ImportBand implements OnInit {
  private importService = inject(ImportService);

  bandName = '';

  readonly loading = signal(false);
  readonly statusMessage = signal('');
  readonly progress = signal(0);
  readonly total = signal(0);
  readonly doneMessage = signal<string | null>(null);
  readonly warnings = signal<string[]>([]);
  readonly infos = signal<string[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.importService.getStatus().subscribe({
      next: (status) => {
        if (status.isRunning) {
          this.bandName = status.bandName ?? '';
          this.progress.set(status.current);
          this.total.set(status.total);
          this.statusMessage.set(`Resuming import: ${status.bandName}`);
          this.loading.set(true);
          this.resumeStream(status.bandName!);
        }
      },
      error: () => {},
    });
  }

  async import(): Promise<void> {
    const name = this.bandName.trim();
    if (!name || this.loading()) return;

    this.loading.set(true);
    this.doneMessage.set(null);
    this.error.set(null);
    this.warnings.set([]);
    this.infos.set([]);
    this.progress.set(0);
    this.total.set(0);
    this.statusMessage.set('');

    await this.runStream(name);
  }

  private async resumeStream(bandName: string): Promise<void> {
    this.doneMessage.set(null);
    this.error.set(null);
    await this.runStream(bandName);
  }

  private async runStream(name: string): Promise<void> {
    try {
      for await (const event of this.importService.streamImport(name)) {
        console.log('[SSE]', event.stage, event.message);
        this.statusMessage.set(event.message);
        if (event.total > 0) this.total.set(event.total);
        if (event.current > 0) this.progress.set(event.current);

        if (event.stage === 'Done') {
          this.progress.set(this.total());
          this.bandName = '';
          this.parseDoneMessage(event.message);
        } else if (event.stage === 'Error') {
          this.error.set(event.message);
        }
      }
    } catch (err: any) {
      this.error.set(err?.message ?? 'Unexpected error');
    } finally {
      this.loading.set(false);
    }
  }

  private parseDoneMessage(message: string): void {
    const parts = message.split('|').map(p => p.trim());
    this.doneMessage.set(parts[0]);
    const warnings: string[] = [];
    const infos: string[] = [];
    for (const part of parts.slice(1)) {
      if (part.startsWith('⚠')) warnings.push(part.slice(1).trim());
      else if (part.startsWith('✓')) infos.push(part.slice(1).trim());
    }
    this.warnings.update(w => [...w, ...warnings]);
    this.infos.set(infos);
  }

  get progressPercent(): number {
    const t = this.total();
    return t > 0 ? Math.round((this.progress() / t) * 100) : 0;
  }
}
