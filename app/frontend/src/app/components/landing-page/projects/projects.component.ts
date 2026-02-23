import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../../directives/scroll-reveal.directive';
import { ProjectCard } from '../../../interfaces/project-card.interface';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly projects: ProjectCard[] = [
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
