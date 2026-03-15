import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumBandSubgenres } from './album-band-subgenres';

describe('AlbumBandSubgenres', () => {
  let component: AlbumBandSubgenres;
  let fixture: ComponentFixture<AlbumBandSubgenres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumBandSubgenres],
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumBandSubgenres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
