import { Component, signal } from '@angular/core';
import { Section } from '../../shared/components/section/section';
import { AddBandForm } from './add-band-form/add-band-form';
import { AddAlbumForm } from './add-album-form/add-album-form';
import { AddMetadataForm } from './add-metadata-form/add-metadata-form';

@Component({
  selector: 'app-create-new-item',
  imports: [Section, AddBandForm, AddAlbumForm, AddMetadataForm],
  templateUrl: './create-new-item.html',
  styleUrl: './create-new-item.scss',
})
export class CreateNewItem {
  readonly tabs = ['Add Album', 'Add Band', 'Add Metadata'];
  readonly activeTab = signal(0);
}
