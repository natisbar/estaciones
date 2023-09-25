import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function regularCharacterValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value;

        if (!value) {
            return null;
        }

        const stringValid = /[^A-Za-zá-úÁ-Ú\s\u00f1\u00d1]/.test(value);

        return stringValid ? {stringValid:true}: null;
    }
}


export function numeroValidatorConRango(rangoMin: number, rangoMax: number): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

      const value = control.value;

      if (!value) {
          return null;
      }

      const numeroPattern = /^-?\d+(\.\d+)?$/.test(value);

      if (!numeroPattern) {
        return { numeroPattern: true };
      }

      const numero = parseFloat(value);

      if (numero < rangoMin || numero > rangoMax) {
        return { rangoInvalido: true };
      }

      return null;
  }
}

// export function validarNumero(): ValidatorFn {
//   return (control:AbstractControl) : ValidationErrors | null => {

//       const value = control.value;

//       if (!value) {
//           return null;
//       }

//       const numeroPattern  = /^-?\d+(\.\d+)?$/.test(value);


//       return numeroPattern ? {numeroPattern:true}: null;
//   }
// }
