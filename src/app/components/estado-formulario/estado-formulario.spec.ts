import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { EstadoFormulario } from './estado-formulario';
import { CampoFormulario } from '../../models/formulario.model';

describe('EstadoFormulario', () => {
  let fixture: ComponentFixture<EstadoFormulario>;
  let componente: EstadoFormulario;
  let formulario: FormGroup;
  let campos: CampoFormulario[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoFormulario]
    }).compileComponents();

    formulario = new FormGroup({
      codigo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      nombre: new FormControl('', { nonNullable: true })
    });
    const codigo = formulario.controls['codigo'];
    const nombre = formulario.controls['nombre'];

    campos = [
      { clave: 'codigo', etiqueta: 'Código SKU', control: codigo },
      { clave: 'nombre', etiqueta: 'Nombre', control: nombre }
    ];

    fixture = TestBed.createComponent(EstadoFormulario);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('formulario', formulario);
    fixture.componentRef.setInput('campos', campos);
    fixture.detectChanges();
  });

  it('muestra seis indicadores del estado general del formulario', () => {
    const indicadores = fixture.nativeElement.querySelectorAll(
      '.indicadores--formulario > .indicador'
    );
    expect(indicadores.length).toBe(6);
  });

  it('refleja valid e invalid como estados excluyentes', () => {
    const indicadores = componente.indicadoresFormulario();
    const valido = indicadores.find((i) => i.etiqueta === 'Válido');
    const invalido = indicadores.find((i) => i.etiqueta === 'Inválido');

    expect(valido?.valor).toBe('no');
    expect(invalido?.valor).toBe('sí');

    formulario.controls['codigo'].setValue('ABC-1234');
    expect(componente.indicadoresFormulario().find((i) => i.etiqueta === 'Válido')?.valor).toBe(
      'sí'
    );
  });

  // setValue no marca el grupo como modificado: eso ocurre al escribir, no al asignar por código.
  it('cambia dirty y pristine cuando un control se marca como modificado', () => {
    expect(
      componente.indicadoresFormulario().find((i) => i.etiqueta === 'Prístino')?.valor
    ).toBe('sí');

    formulario.controls['nombre'].markAsDirty();

    const etiquetas = componente
      .indicadoresFormulario()
      .map((i) => `${i.etiqueta}:${i.valor}`)
      .join(' ');
    expect(etiquetas).toContain('Modificado:sí');
    expect(etiquetas).toContain('Prístino:no');
    expect(etiquetas).toContain('Intacto:sí');
  });

  it('cambia touched y untouched cuando un control se marca como tocado', () => {
    formulario.controls['nombre'].markAsTouched();

    const etiquetas = componente
      .indicadoresFormulario()
      .map((i) => `${i.etiqueta}:${i.valor}`)
      .join(' ');
    expect(etiquetas).toContain('Tocado:sí');
    expect(etiquetas).toContain('Intacto:no');
  });

  it('genera cuatro indicadores por control', () => {
    expect(componente.indicadoresControl(formulario.controls['nombre']).length).toBe(4);
  });

  it('*ngFor lista un bloque por control recibido', () => {
    expect(fixture.nativeElement.querySelectorAll('.control-estado').length).toBe(2);
  });

  it('marca el bloque del control con error cuando el control es inválido', () => {
    expect(
      fixture.nativeElement.querySelectorAll('.control-estado--alerta').length
    ).toBe(1);

    formulario.controls['codigo'].setValue('ABC-1234');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.control-estado--alerta').length).toBe(0);
  });
});
