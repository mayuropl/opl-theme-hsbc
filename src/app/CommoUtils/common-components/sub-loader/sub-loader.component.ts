import { Component } from '@angular/core';
import { LoaderService } from '../../common-services/LoaderService';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sub-loader',
  templateUrl: './sub-loader.component.html',
  styleUrl: './sub-loader.component.scss'
})
export class SubLoaderComponent {
  readonly staticDemo = environment.staticDemo;

  color = 'primary';
  mode = 'indeterminate';
  value = 50;
  isLoading = false;
  loaderSubscription: Subscription;

  constructor(private loaderService: LoaderService) {
    if (this.staticDemo) {
      this.isLoading = false;
      return;
    }
    this.loaderSubscription = this.loaderService.getSubLoaderFlag().subscribe((loaderRes) => {
      this.isLoading = loaderRes;
    });
  }
}
