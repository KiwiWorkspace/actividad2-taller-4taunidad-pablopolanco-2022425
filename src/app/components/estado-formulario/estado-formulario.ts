import { NgFor } from '@angular/common';
import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { CampoFormulario, Indicador } from '../../models/formulario.model';

@Component({
  selector: 'app-estado-formulario',
  imports: [NgFor],
  templateUrl: './estado-formulario.html',
  styleUrl: './estado-formulario.css'
})
export class EstadoFormulario {
  readonly formulario = input.required<AbstractControl>();
  readonly campos = input.required<CampoFormulario[]>();

  indicadoresFormulario(): Indicador[] {
    const formulario = this.formulario();
    return [
      { etiqueta: 'Válido', valor: formulario.valid ? 'sí' : 'no', favorable: formulario.valid },
      { etiqueta: 'Inválido', valor: formulario.invalid ? 'sí' : 'no', favorable: !formulario.invalid },
      { etiqueta: 'Tocado', valor: formulario.touched ? 'sí' : 'no', favorable: formulario.touched },
      { etiqueta: 'Intacto', valor: formulario.untouched ? 'sí' : 'no', favorable: formulario.untouched },
      { etiqueta: 'Modificado', valor: formulario.dirty ? 'sí' : 'no', favorable: formulario.dirty },
      { etiqueta: 'Prístino', valor: formulario.pristine ? 'sí' : 'no', favorable: formulario.pristine }
    ];
  }

  indicadoresControl(control: AbstractControl): Indicador[] {
    return [
      { etiqueta: 'válido', valor: control.valid ? 'sí' : 'no', favorable: control.valid },
      { etiqueta: 'inválido', valor: control.invalid ? 'sí' : 'no', favorable: !control.invalid },
      { etiqueta: 'tocado', valor: control.touched ? 'sí' : 'no', favorable: control.touched },
      { etiqueta: 'modificado', valor: control.dirty ? 'sí' : 'no', favorable: control.dirty }
    ];
  }
}
