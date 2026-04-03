import { Component } from '@angular/core';
import { Header } from "./core/components/header/header";
import { Footer } from "./core/components/footer/footer";
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { Loader } from './shared/components/loader/loader';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, RouterOutlet, Toast, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
