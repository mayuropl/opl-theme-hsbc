import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { Constants } from '../../constants';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  readonly staticDemo = environment.staticDemo;

  constructor(private loaderService: LoaderService) {
  }
  color = 'primary';
  mode = 'indeterminate';
  value = 50;
  isLoading: Subject<boolean> = this.loaderService.isLoading;
  isLocal : boolean = false;
  ngOnInit() {
    this.isLocal = Constants.IS_LOCAL
  }


}
