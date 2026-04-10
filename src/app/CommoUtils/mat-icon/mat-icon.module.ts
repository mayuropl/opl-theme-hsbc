import { NgModule } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../merterial.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, MaterialModule],
})
export class MatIconModule {
  private path: string = './assets/images/MatIcon-SVG';
  private WebSite: string ='./assets/images/MatIcon-SVG/website';
  private Social_IconCont: string = './assets/images/Header-Footer/social-icon';
  constructor(
    private domSanitizer: DomSanitizer,
    public matIconRegistry: MatIconRegistry
  ) {
    this.matIconRegistry
      /* Dashboard Icons  Start*/
      // .addSvgIcon("Dashboard_Icon", this.setPath(`${this.Dashboard_IconCont}/Dashboard_Icon.svg`))
      // .addSvgIcon("building_Icon", this.setPath(`${this.Dashboard_IconCont}/building_Icon.svg`))
      // .addSvgIcon("download_Icon", this.setPath(`${this.Dashboard_IconCont}/download_Icon.svg`))
      // .addSvgIcon("Database_Icon", this.setPath(`${this.Dashboard_IconCont}/Database_Icon.svg`))
      /* Dashboard Icons  End*/

      .addSvgIcon('Profile_Icon', this.setPath(`${this.path}/Profile_Icon.svg`))
      .addSvgIcon('thankyou_Icon', this.setPath(`${this.path}/thankyou_Icon.svg`))
      .addSvgIcon('Download', this.setPath(`${this.path}/download.svg`))
      .addSvgIcon('check_circle', this.setPath(`${this.path}/check_circle.svg`))
      .addSvgIcon(
        'check_circle_Fill',
        this.setPath(`${this.path}/check_circle_Fill.svg`)
      )
      .addSvgIcon('menu_Icon', this.setPath(`${this.path}/menu_Icon.svg`))
      .addSvgIcon('close', this.setPath(`${this.path}/close.svg`))
      .addSvgIcon('filter_list', this.setPath(`${this.path}/filter_list.svg`))
      .addSvgIcon('search', this.setPath(`${this.path}/search.svg`))
      .addSvgIcon('arrow_back', this.setPath(`${this.path}/arrow_back.svg`))
      .addSvgIcon('arrow_drop_down', this.setPath(`${this.path}/arrow_drop_down.svg`))
      

      .addSvgIcon('delete_Icon', this.setPath(`${this.path}/delete_Icon.svg`))
      .addSvgIcon(
        'visibility_Icon',
        this.setPath(`${this.path}/visibility_Icon.svg`)
      )
      .addSvgIcon(
        'fileSearch_Icon',
        this.setPath(`${this.path}/fileSearch_Icon.svg`)
      )
      .addSvgIcon(
        'eye_Icon',
        this.setPath(`${this.path}/eye_Icon.svg`)
      )


      .addSvgIcon('chevron_left', this.setPath(`${this.path}/chevron_left.svg`))

      .addSvgIcon('expand_circle_down', this.setPath(`${this.path}/expand_circle_down.svg`))
      .addSvgIcon('expand_circle_up', this.setPath(`${this.path}/expand_circle_up.svg`))

      .addSvgIcon('company_Icon', this.setPath(`${this.path}/company_Icon.svg`))
      .addSvgIcon('summary_Icon', this.setPath(`${this.path}/summary_Icon.svg`))

      .addSvgIcon(
        'send_Icon_list',
        this.setPath(`${this.path}/send_Icon_list.svg`)
      )
      .addSvgIcon('send_Icon', this.setPath(`${this.path}/send_Icon.svg`))
      .addSvgIcon('whatsapp_Icon', this.setPath(`${this.path}/whatsapp.svg`))

      .addSvgIcon('expand_less', this.setPath(`${this.path}/expand_less.svg`))
      .addSvgIcon('expand_more', this.setPath(`${this.path}/expand_more.svg`))
      .addSvgIcon('PDF_Icon', this.setPath(`${this.path}/PDF_Icon.svg`))

      .addSvgIcon('excel_Icon', this.setPath(`${this.path}/excel_Icon.svg`))
      .addSvgIcon(
        'aadharCard_Icon',
        this.setPath(`${this.path}/AadharCard_Icon.svg`)
      )

      .addSvgIcon('Info_Icon', this.setPath(`${this.path}/info_Icon.svg`))
      .addSvgIcon('check_Icon', this.setPath(`${this.path}/check_Icon.svg`))

      .addSvgIcon('report_Icon', this.setPath(`${this.path}/report_Icon.svg`))

      // Website Icon
       .addSvgIcon("scheme_Icon", this.setPath(`${this.WebSite}/scheme_Icon.svg`))
      .addSvgIcon("speaker_Icon", this.setPath(`${this.WebSite}/speaker_Icon.svg`))
      .addSvgIcon("loan_Icon", this.setPath(`${this.WebSite}/loan_Icon.svg`))      

      .addSvgIcon("ContactUs_Icon", this.setPath(`${this.path}/ContactUs_Icon.svg`))
      .addSvgIcon("circle_Icon", this.setPath(`${this.path}/circle_Icon.svg`))

      
      
      // Website Icon

      /* Scocial Icon Started */
      .addSvgIcon(
        'Mail_Icon',
        this.setPath(`${this.Social_IconCont}/mail_Icon.svg`)
      )
      .addSvgIcon(
        'Phone_Icon',
        this.setPath(`${this.Social_IconCont}/phone_Icon.svg`)
      )
  }
  private setPath(url: string): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
