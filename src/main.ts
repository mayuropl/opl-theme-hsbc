import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { seedStaticDemoLocalStorage } from './app/CommoUtils/static-demo/static-demo.seed';

if (environment.production) {
  enableProdMode();
}

if (environment.staticDemo) {
  seedStaticDemoLocalStorage();
  document.body.classList.add('static-demo');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
