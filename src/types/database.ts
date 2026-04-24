// Database types for AppQuote — Supabase
// Run: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          rol: "admin" | "vendedor";
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["usuarios"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["usuarios"]["Insert"]>;
      };
      clientes: {
        Row: {
          id: string;
          nombre: string;
          empresa: string | null;
          ruc: string | null;
          direccion: string | null;
          email: string | null;
          telefono: string | null;
          ciudad: string | null;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clientes"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["clientes"]["Insert"]>;
      };
      productos: {
        Row: {
          id: string;
          sku: string;
          nombre: string;
          descripcion: string | null;
          unidad: "m2" | "unidad" | "ml";
          volumen_m3_unitario: number;
          peso_kg_unitario: number;
          precio_eur_unitario: number;
          stock_actual: number;
          partida_arancelaria: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["productos"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["productos"]["Insert"]>;
      };
      historial_precios_productos: {
        Row: {
          id: string;
          producto_id: string;
          fecha: string;
          precio_eur_unitario: number;
          notas: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["historial_precios_productos"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["historial_precios_productos"]["Insert"]>;
      };
      tarifas_flete: {
        Row: {
          id: string;
          fecha_desde: string;
          fecha_hasta: string | null;
          ocean_freight_eur: number;
          origin_charge_eur: number;
          pick_up_eur: number;
          seguro_usd: number;
          naviera: string | null;
          transit_time_dias: number | null;
          free_days: number | null;
          tipo: string;
          notas: string | null;
          peso_max_kg: number | null;
          volumen_max_m3: number | null;
          surcharge_sobrepeso_eur: number | null;
          surcharge_feriado_porcentaje: number | null;
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tarifas_flete"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tarifas_flete"]["Insert"]>;
      };
      costos_importacion: {
        Row: {
          id: string;
          fecha_desde: string;
          fecha_hasta: string | null;
          igv_porcentaje: number;
          ipm_pen: number;
          percepcion_igv_porcentaje: number;
          transporte_interno_usd: number;
          gestion_almacen_usd: number;
          visto_bueno_usd: number;
          gate_in_usd: number;
          gestion_operativa_usd: number;
          comision_usd: number;
          igv_servicios_porcentaje: number;
          notas: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["costos_importacion"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["costos_importacion"]["Insert"]>;
      };
      tarifas_transporte_local: {
        Row: {
          id: string;
          zona: string;
          precio_por_m3_pen: number;
          minimo_pen: number;
          fecha_desde: string;
          fecha_hasta: string | null;
          activo: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tarifas_transporte_local"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tarifas_transporte_local"]["Insert"]>;
      };
      lotes_recepcion: {
        Row: {
          id: string;
          numero_contenedor: string;
          fecha_llegada: string;
          fob_usd: number;
          flete_usd: number;
          seguro_usd: number;
          cif_usd: number;
          tasa_cambio: number;
          total_volumen_m3: number | null;
          total_peso_kg: number | null;
          costo_flete_total_eur: number | null;
          costo_importacion_total_pen: number | null;
          notas: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lotes_recepcion"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lotes_recepcion"]["Insert"]>;
      };
      lotes_detalle: {
        Row: {
          id: string;
          lote_id: string;
          producto_id: string;
          cantidad_recibida: number;
          costo_unitario_eur: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lotes_detalle"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lotes_detalle"]["Insert"]>;
      };
      cotizaciones: {
        Row: {
          id: string;
          numero_cotizacion: string;
          cliente_id: string;
          usuario_id: string;
          direccion_obra: string | null;
          zona_transporte: string | null;
          estado: "borrador" | "enviada" | "aceptada" | "rechazada" | "vencida";
          tasa_cambio_eur_pen: number;
          tasa_cambio_usd_pen: number;
          total_volumen_m3: number;
          total_peso_kg: number;
          subtotal_material_pen: number;
          subtotal_flete_pen: number;
          subtotal_aduana_pen: number;
          subtotal_transporte_local_pen: number;
          margen_porcentaje: number;
          subtotal_con_margen_pen: number;
          igv_venta_pen: number;
          total_final_pen: number;
          pdf_url: string | null;
          pdf_generado_en: string | null;
          notas: string | null;
          validez_dias: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cotizaciones"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["cotizaciones"]["Insert"]>;
      };
      detalles_cotizacion: {
        Row: {
          id: string;
          cotizacion_id: string;
          producto_id: string;
          lote_id: string | null;
          cantidad: number;
          precio_eur_snapshot: number;
          volumen_m3_snapshot: number;
          peso_kg_snapshot: number;
          subtotal_material_pen: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["detalles_cotizacion"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["detalles_cotizacion"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

// Convenience row types
export type Usuario = Database["public"]["Tables"]["usuarios"]["Row"];
export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type Producto = Database["public"]["Tables"]["productos"]["Row"];
export type TarifaFlete = Database["public"]["Tables"]["tarifas_flete"]["Row"];
export type CostoImportacion = Database["public"]["Tables"]["costos_importacion"]["Row"];
export type TarifaTransporteLocal = Database["public"]["Tables"]["tarifas_transporte_local"]["Row"];
export type LoteRecepcion = Database["public"]["Tables"]["lotes_recepcion"]["Row"];
export type LoteDetalle = Database["public"]["Tables"]["lotes_detalle"]["Row"];
export type Cotizacion = Database["public"]["Tables"]["cotizaciones"]["Row"];
export type DetalleCotizacion = Database["public"]["Tables"]["detalles_cotizacion"]["Row"];
