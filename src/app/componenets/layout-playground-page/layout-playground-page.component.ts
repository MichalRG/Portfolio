import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-layout-playground-page',
  imports: [TranslateModule],
  templateUrl: './layout-playground-page.component.html',
  styleUrl: './layout-playground-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutPlaygroundPageComponent {}
