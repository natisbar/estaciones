import Swal, { SweetAlertIcon } from 'sweetalert2';

export class ModalNotificaciones {
  titulo!: string;
  icono!: SweetAlertIcon;
  imageUrl!: string;
  texto!: string;
  confirmButtonColor: string = '#28ae60';

  public modalBasico(icono: SweetAlertIcon, texto: string) {
    // this.titulo = titulo;
    this.icono = icono;
    this.texto = texto;
    return Swal.fire({
      // title: this.titulo,
      icon: this.icono,
      text: this.texto,
      confirmButtonColor: this.confirmButtonColor,
      confirmButtonText: 'Entendido',
    }).then((result) => {
      return result;
    });
  }
}
