import { Component, OnInit } from '@angular/core';
import { AboutComponent } from './componenets/about/about.component';
import { ContactComponent } from './componenets/contact/contact.component';
import { FooterComponent } from './componenets/footer/footer.component';
import { HeaderComponent } from './componenets/header/header.component';
import { HeroComponent } from './componenets/hero/hero.component';
import { ProjectsComponent } from './componenets/projects/projects.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    HeaderComponent,
    HeroComponent,
    ContactComponent,
    FooterComponent,
    AboutComponent,
    ProjectsComponent,
  ],
})
export class AppComponent implements OnInit {
  title = 'Michal';
  showIntro = true;

  ngOnInit() {
    setTimeout(() => {
      this.showIntro = false;
    }, 1500);
  }
}
