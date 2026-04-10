import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { LeftMenuStateService } from './left-menu-state.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  private static initialLayoutDone = false;
  isCondensed = false;
  isDashRouterUrl: any = false;
  isConfigRouterUrl: any = false;
  constructor(
    public router: Router,
    private leftMenuState: LeftMenuStateService
  ) { }

  ngOnInit() {
    this.isDashRouterUrl = (this.router.url.includes('thankyou'));
    this.isConfigRouterUrl = (this.router.url.includes('bureauConfig'));
  }

  isMobile() {
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  }

  ngAfterViewInit() {
    document.body.classList.remove('authentication-bg');
    document.body.classList.remove('authentication-bg-pattern');

    if (!this.isMobile()) {
      document.body.classList.add('sidebar-enable');
      if (!LayoutComponent.initialLayoutDone) {
        document.body.classList.add('closeLeftmenu');
        LayoutComponent.initialLayoutDone = true;
      }
    }
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle('right-bar-enabled');
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    document.body.classList.toggle('sidebar-enable');
    if (!this.isMobile()) {
      document.body.classList.toggle('enlarged');
      this.isCondensed = !this.isCondensed;
    }
  }
 
  onContentPageClick() {
    if (typeof document !== 'undefined') {
      document.body.classList.add('closeLeftmenu');
      this.leftMenuState.setOpenedByButton(false);
      this.leftMenuState.notifyStateChanged();
    }
  }
}
