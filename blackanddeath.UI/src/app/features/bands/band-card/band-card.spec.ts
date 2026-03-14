import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandCard } from './band-card';

describe('BandCard', () => {
  let component: BandCard;
  let fixture: ComponentFixture<BandCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BandCard],
    }).compileComponents();

    fixture = TestBed.createComponent(BandCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
