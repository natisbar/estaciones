import { NgModule} from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: 'inicio',
    loadChildren: () => import('./feature/home/home.module').then(m => m.HomeModule)
  },
  {
    path: '**',
    redirectTo: '/inicio',
    // pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
              scrollPositionRestoration: 'enabled',
              anchorScrolling: 'enabled',
              useHash: false
            })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
