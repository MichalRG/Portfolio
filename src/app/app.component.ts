import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
  showIntro = true;

  ngOnInit() {
    setTimeout(() => {
      this.showIntro = false;
    }, 1500);
  }
}
