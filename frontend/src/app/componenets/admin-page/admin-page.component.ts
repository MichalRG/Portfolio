import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  imports: [],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent {}
