import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ClickOutsideModule } from 'ng-click-outside';

import { UIModule } from '../shared/ui/ui.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';
import { RightsidebarComponent } from './rightsidebar/rightsidebar.component';
import { ShortNamePipe } from 'src/app/CommoUtils/pipe/short-name.pipe';
import { HeaderImagePipe, HeaderImageSmallPipe } from 'src/app/CommoUtils/pipe/header-image.pipe';
import { SidemenubarComponent } from './sidemenubar/sidemenubar.component';
import { MaterialModule } from 'src/app/CommoUtils/merterial.module';


@NgModule({
  declarations: [LayoutComponent, SidebarComponent, TopbarComponent, FooterComponent, RightsidebarComponent,ShortNamePipe,HeaderImagePipe, HeaderImageSmallPipe, SidemenubarComponent],
  imports: [
    CommonModule,
    RouterModule,
    NgbDropdownModule,
    ClickOutsideModule,
    UIModule,
    MaterialModule
  ]
})
export class LayoutsModule { }
