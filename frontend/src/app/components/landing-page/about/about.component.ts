import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit {
  readonly techTags = [
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
  readonly interestTags = [
    'AI',
    'ML',
    'UNITY',
    'UE',
    'QC',
    'DL',
    'PYTHON',
    'RPG',
    'GAMES',
    'SF_FANTASY',
    'BOARD_GAME',
    'SW_LOTR',
    'PSYCHOLOGY',
    'PHILOSOPHY',
  ];
  techChunks: string[][] = [];
  interestChunks: string[][] = [];
  readonly descriptionLines = [
    { key: 'ABOUT.DESCRIPTION_LINE_1', delay: 0 },
    { key: 'ABOUT.DESCRIPTION_LINE_2', delay: 0.5 },
    { key: 'ABOUT.DESCRIPTION_LINE_3', delay: 1 },
  ];

  readonly tagsDelay =
    Math.max(
      0,
      ...this.descriptionLines.map(
        (descriptionData) => descriptionData.delay + 0.5,
      ),
    ) || 0;

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
