import { Component } from '@angular/core';
import { Header } from "./core/components/header/header";
import { Footer } from "./core/components/footer/footer";
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { Loader } from './shared/components/loader/loader';
import { AgeGate } from './shared/components/age-gate/age-gate';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, RouterOutlet, Toast, Loader, AgeGate],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
