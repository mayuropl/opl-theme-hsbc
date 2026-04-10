import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
 
@Injectable({ providedIn: 'root' })
export class LeftMenuStateService {
  private readonly changed = new Subject<void>();
  /** True when menu was opened via topbar button; hover enter/leave on side menu should be ignored. */
  private _openedByButton = false;

  get onLeftMenuStateChanged() {
    return this.changed.asObservable();
  }

  get openedByButton(): boolean {
    return this._openedByButton;
  }

  setOpenedByButton(value: boolean): void {
    this._openedByButton = value;
  }

  notifyStateChanged(): void {
    this.changed.next();
    this.scheduleMaterialOverlayReposition();
  }

  /**
   * CDK overlays (mat-select, mat-menu, etc.) position from the trigger at open time.
   * Sidebar open/close shifts layout without a real window resize, so panels stay misaligned.
   * A synthetic resize nudges ViewportRuler / position strategies to recalculate (see .sidemenu-wrapper transition ~0.3s).
   */
  private scheduleMaterialOverlayReposition(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const nudge = () => window.dispatchEvent(new Event('resize'));
    requestAnimationFrame(() => requestAnimationFrame(nudge));
    setTimeout(nudge, 320);
  }
}
