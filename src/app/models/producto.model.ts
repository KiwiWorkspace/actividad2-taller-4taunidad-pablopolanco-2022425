export const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpieza', 'Tecnología', 'Oficina'] as const;

export type Categoria = (typeof CATEGORIAS)[number];

/** Datos que captura el formulario. El id y la fecha los asigna el servicio. */
export interface ProductoFormulario {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: Categoria;
  stock: number;
  activo: boolean;
}

/** Producto completo, tal como queda almacenado en el servicio. */
export interface Producto extends ProductoFormulario {
  id: number;
  fechaRegistro: string;
}

export interface RespuestaRegistro {
  exito: boolean;
  mensaje: string;
  producto: Producto;
}
