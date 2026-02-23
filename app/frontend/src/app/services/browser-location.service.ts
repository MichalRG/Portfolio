import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserLocation {
  navigate(url: string) {
    window.location.href = url;
  }
}
