import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-about',
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  techTags = [
    'Angular',
    'Node.js',
    'TypeScript',
    'JavaScript',
    'HTML',
    'SCSS',
    'RxJS',
    'AWS',
    'Docker',
    'Git',
    'CI/CD',
    'REST API',
  ];
  interestTags = [
    'AI',
    'Machine Learning',
    'Gaming',
    'Unity',
    'Unreal Engine',
    'Quantum Computing',
    'Deep Learning',
    'Python',
    'Tabletop RPGs',
    'Computer Games',
    'Books',
    'Science Fiction & Fantasy',
    'Board Games',
    'Star Wars & LOTR 💗',
    'Psychology',
    'Philosophy',
  ];
  techChunks: string[][] = [];
  interestChunks: string[][] = [];
  descriptionLines = [
    { key: 'ABOUT.DESCRIPTION_LINE_1', delay: 0 },
    { key: 'ABOUT.DESCRIPTION_LINE_2', delay: 1.5 },
    { key: 'ABOUT.DESCRIPTION_LINE_3', delay: 3 },
  ];

  ngOnInit(): void {
    this.techChunks = this.chunkTags(this.techTags);
    this.interestChunks = this.chunkTags(this.interestTags);
  }

  private chunkTags(tags: string[], size = 6): string[][] {
    return Array.from({ length: Math.ceil(tags.length / size) }, (_, i) =>
      tags.slice(i * size, i * size + size),
    );
  }
}
