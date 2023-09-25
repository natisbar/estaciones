import { CommonModule} from "@angular/common";
import { NgModule } from "@angular/core";
import { HttpGeneralService } from "./services/http-general.service";
import { ModalNotificaciones } from "./services/modal.service";


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
    HttpGeneralService,
    ModalNotificaciones
  ]
})
export class CoreModule {}
