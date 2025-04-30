import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './componenets/landing-page/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, HeaderComponent],
})
export class AppComponent implements OnInit {
  showIntro = true;

  ngOnInit() {
    setTimeout(() => {
      this.showIntro = false;
    }, 1500);
  }
}
