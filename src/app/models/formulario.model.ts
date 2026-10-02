import { AbstractControl } from '@angular/forms';

import { ProductoFormulario } from './producto.model';

export type ClaveCampo = keyof ProductoFormulario;

/** Claves que Angular usa en el objeto errors de cada control. */
export type ClaveError = 'required' | 'minlength' | 'maxlength' | 'min' | 'max' | 'pattern';

export interface CampoFormulario {
  clave: ClaveCampo;
  etiqueta: string;
  control: AbstractControl;
}

export interface Indicador {
  etiqueta: string;
  valor: string;
  favorable: boolean;
}

export const LIMITES = {
  nombreMin: 3,
  nombreMax: 50,
  descripcionMin: 10,
  descripcionMax: 300,
  precioMin: 0.01,
  precioMax: 999999.99,
  stockMin: 0,
  stockMax: 100000
} as const;

export const PATRONES = {
  codigo: /^[A-Z]{3}-[A-Z0-9]{4,8}$/,
  nombre: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .'-]+$/,
  precio: /^\d{1,6}(\.\d{1,2})?$/,
  stock: /^\d+$/
} as const;

export const MENSAJES_ERROR: Record<ClaveCampo, Partial<Record<ClaveError, string>>> = {
  codigo: {
    required: 'El código SKU es obligatorio.',
    pattern: 'Formato esperado: tres letras en mayúsculas, guion y de 4 a 8 caracteres, por ejemplo ABC-1234.',
    maxlength: 'El código SKU admite máximo 12 caracteres.'
  },
  nombre: {
    required: 'El nombre es obligatorio.',
    minlength: 'El nombre debe tener al menos 3 caracteres.',
    maxlength: 'El nombre admite máximo 50 caracteres.',
    pattern: 'El nombre solo admite letras, números, espacios, punto, apóstrofo o guion.'
  },
  descripcion: {
    required: 'La descripción es obligatoria.',
    minlength: 'La descripción debe tener al menos 10 caracteres.',
    maxlength: 'La descripción admite máximo 300 caracteres.'
  },
  precio: {
    required: 'El precio es obligatorio.',
    min: 'El precio debe ser mayor que cero.',
    max: 'El precio no puede superar 999999.99.',
    pattern: 'El precio admite hasta seis cifras enteras y dos decimales.'
  },
  categoria: {
    required: 'Selecciona una categoría de la lista.'
  },
  stock: {
    required: 'El stock es obligatorio.',
    min: 'El stock no puede ser negativo.',
    max: 'El stock no puede superar 100000 unidades.',
    pattern: 'El stock debe ser un número entero, sin decimales ni signo negativo.'
  },
  activo: {}
};
