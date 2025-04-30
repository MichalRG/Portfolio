import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface AnimationExample {
  title: string;
  animationClass: string;
  codeSnippet?: string;
}

@Component({
  standalone: true,
  selector: 'app-animations-page',
  templateUrl: './animations-page.component.html',
  styleUrls: ['./animations-page.component.scss'],
  imports: [CommonModule, TranslateModule],
})
export class AnimationsPageComponent {
  animationExamples: AnimationExample[] = [
    {
      title: 'ANIMATIONS.FADEIN',
      animationClass: 'fade-in',
      codeSnippet: `
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}`,
    },
    {
      title: 'ANIMATIONS.SLIDEUPFADE',
      animationClass: 'slide-up-fade',
      codeSnippet: `
@keyframes slideUpFade {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}`,
    },
    {
      title: 'ANIMATIONS.BOUNCE',
      animationClass: 'bounce',
      codeSnippet: `
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}`,
    },
    {
      title: 'ANIMATIONS.ROTATE',
      animationClass: 'rotate',
      codeSnippet: `
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
      `,
    },
    {
      title: 'ANIMATIONS.PULSE',
      animationClass: 'pulse',
      codeSnippet: `
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}`,
    },
    {
      title: 'Fancy Entrance',
      animationClass: 'fancy-entrance',
      codeSnippet: `
@keyframes fancyEntrance {
  0% {
    opacity: 0;
    transform: translateX(-50px) skewX(5deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) skewX(0deg);
  }
}`,
    },
  ];
}
