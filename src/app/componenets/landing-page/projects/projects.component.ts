import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  projects = [
    {
      title: 'PROJECTS.UNIVERSITY.NAME',
      icon: 'university.svg',
      description: 'PROJECTS.UNIVERSITY.DESCRIPTION',
      linkDescription: 'PROJECTS.UNIVERSITY.LINK',
      link: 'https://ubb.edu.pl/en/',
    },
    {
      title: 'PROJECTS.CERT.NAME',
      icon: 'certificates.svg',
      description: 'PROJECTS.CERT.DESCRIPTION',
      linkDescription: 'PROJECTS.CERT.LINK',
      link: '#',
    },
    {
      title: 'PROJECTS.GITHUB.NAME',
      icon: 'github.svg',
      description: 'PROJECTS.GITHUB.DESCRIPTION',
      linkDescription: 'PROJECTS.GITHUB.LINK',
      link: 'https://github.com/MichalRG',
    },
    {
      title: 'PROJECTS.EXPERIENCE.NAME',
      icon: 'briefcase.svg',
      description: 'PROJECTS.EXPERIENCE.DESCRIPTION',
      link: null,
    },
  ];
}
