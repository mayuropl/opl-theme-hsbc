import { CommonMethods } from './CommoUtils/common-methods';
import {ChangeDetectorRef, Component, HostListener} from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { LoaderService } from './CommoUtils/common-services/LoaderService';
import { CommonService } from './CommoUtils/common-services/common.service';
import { MsmeService } from './services/msme.service';
import { Constants } from 'src/app/CommoUtils/constants';
import {ChangeDetection} from '@angular/cli/lib/config/workspace-schema';
import { WebSocketService } from './services/web-socket.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HSBC';
  userActivity:any;

  permissionList=[];

  constructor(private router: Router,private loaderService: LoaderService, private titleService: Title,private commonMethod:CommonMethods,
    private activatedRoute: ActivatedRoute,private msmeService: MsmeService, private commonService: CommonService, private cdr: ChangeDetectorRef,
     private webSocketService:WebSocketService) {

    // For state change
    this.router.events.subscribe((event) => {
      if (environment.staticDemo) {
        return;
      }
      if (event instanceof NavigationStart) {
        this.loaderService.show(); // Show loading indicator
      }

      if (event instanceof NavigationEnd) {
        this.loaderService.hide(); // Hide loading indicator
      }

      if (event instanceof NavigationError) {
        this.loaderService.hide(); // Hide loading indicator on error
      }
    });
  }

  ngOnInit(): void {
    // console.log("*************************");
    // console.log("*************************");
    // console.log("Into app component");
    // console.log("*************************");
    // console.log("*************************");
    this.titleService.setTitle(this.title);
     this.msmeService.loadConfig().then(() => {
      if (!environment.staticDemo) {
        clearTimeout(this.userActivity);
        this.setTimeout();
        console.log("Time Out Set From Backend : ",this.msmeService.timeoutMs);
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const rt = this.getChildTitle(this.activatedRoute);
      rt.data.subscribe(data => this.titleService.setTitle(data.title));
    });

    console.log(this.cdr.detectChanges());

  }

  setTimeout() {
    if (environment.staticDemo) {
      return;
    }
    this.userActivity = setTimeout(() => {
      if (true) {
       this.commonMethod.logoutUser();
      }
    },   this.msmeService.timeoutMs);
  }

  @HostListener('window:mousemove')
  @HostListener('window:mouseover')
  @HostListener('window:onkeydown')
  @HostListener('window:onkeypress')
  @HostListener('window:onkeyup')
  @HostListener('window:onmousedown')
  @HostListener('window:ondblclick')
  @HostListener('window:click')
  @HostListener('window:onfocus')
  @HostListener('window:onscroll')
   refreshUserState() {
    if (environment.staticDemo) {
      return;
    }
    clearTimeout(this.userActivity);
    this.setTimeout();
  }

  getChildTitle(activatedRoute: ActivatedRoute) {
    if (activatedRoute.firstChild) {
      return this.getChildTitle(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent right-click menu
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Prevent Ctrl+V (Paste)
    // if (event.ctrlKey && event.key === 'v') {
    //   event.preventDefault();
    // }

    // Prevent Ctrl+P (Print)
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
    }

    // Prevent Print Screen key (not fully reliable)
    if (event.key === 'PrintScreen') {
      event.preventDefault();
    }

    // Prevent Alt+Print Screen
    if (event.altKey && event.key === 'PrintScreen') {
      event.preventDefault();
    }
  }
}
