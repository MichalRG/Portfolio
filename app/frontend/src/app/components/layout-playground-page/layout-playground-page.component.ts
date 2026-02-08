import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-layout-playground-page',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './layout-playground-page.component.html',
  styleUrls: ['./layout-playground-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutPlaygroundPageComponent {}
