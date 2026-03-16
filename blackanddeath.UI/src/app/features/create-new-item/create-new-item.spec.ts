import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewItem } from './create-new-item';

describe('CreateNewItem', () => {
  let component: CreateNewItem;
  let fixture: ComponentFixture<CreateNewItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateNewItem],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateNewItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
