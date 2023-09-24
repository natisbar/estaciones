import { CommonModule} from "@angular/common";
import { NgModule } from "@angular/core";
import { HttpGeneralService } from "./services/http-general.service";


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule
  ],
  providers: [
    HttpGeneralService
  ]
})
export class CoreModule {}
