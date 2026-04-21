import { Component, inject } from '@angular/core';
import { AgeGateService } from '../../../core/services/age-gate.service';

@Component({
  selector: 'app-age-gate',
  standalone: true,
  templateUrl: './age-gate.html',
  styleUrl: './age-gate.scss',
})
export class AgeGate {
  readonly ageGate = inject(AgeGateService);
}
