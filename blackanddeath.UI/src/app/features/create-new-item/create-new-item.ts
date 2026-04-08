import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Section } from '../../shared/components/section/section';
import { AddBandForm } from './add-band-form/add-band-form';
import { AddAlbumForm } from './add-album-form/add-album-form';
import { AddVideoForm } from './add-video-form/add-video-form';
import { CanComponentDeactivate } from '../../core/guards/unsaved-changes.guard';
import { FormDirtyService } from '../../core/services/form-dirty.service';

@Component({
  selector: 'app-create-new-item',
  imports: [Section, AddBandForm, AddAlbumForm, AddVideoForm],
  templateUrl: './create-new-item.html',
  styleUrl: './create-new-item.scss',
})
export class CreateNewItem implements CanComponentDeactivate, OnInit, OnDestroy {
  readonly tabs = ['Add Album', 'Add Band', 'Add Video'];
  readonly activeTab = signal(0);

  private readonly formDirty = inject(FormDirtyService);

  onTabChange(index: number): void {
    if (this.formDirty.dirty()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
      this.formDirty.markClean();
    }
    this.activeTab.set(index);
  }

  ngOnInit(): void {
    this.formDirty.markClean();
  }

  ngOnDestroy(): void {
    this.formDirty.markClean();
  }

  canDeactivate(): boolean {
    return !this.formDirty.dirty();
  }
}
