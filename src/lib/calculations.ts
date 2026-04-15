// ──────────────────────────────────────────────────────────────────────────────
// AppQuote — Motor de cálculo de costos de cotización
// ──────────────────────────────────────────────────────────────────────────────

export interface ItemCotizacion {
  producto_id: string;
  cantidad: number;
  precio_eur_unitario: number;
  volumen_m3_unitario: number;
  peso_kg_unitario: number;
}

export interface TarifaFleteCal {
  ocean_freight_eur: number;
  origin_charge_eur: number;
  pick_up_eur: number;
  seguro_usd: number; // porcentaje del CIF
  volumen_max_m3: number;
}

export interface CostoImportacionCal {
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
}

export interface TarifaTransporteCal {
  precio_por_m3_pen: number;
  minimo_pen: number;
}

export interface DesgloseCostos {
  // Volúmenes
  totalVolumenM3: number;
  totalPesoKg: number;

  // Material
  subtotalMaterialEur: number;
  subtotalMaterialPen: number;

  // Flete internacional (prorrateado)
  fletoOceanEur: number;
  fleteOriginEur: number;
  fletePickupEur: number;
  seguroUsd: number;
  subtotalFleteEur: number;
  subtotalFletePen: number;

  // Aduana / importación
  adValorem: number;        // 0 para estos productos (asumimos 0%)
  igvAduana: number;        // IGV sobre CIF+Ad Valorem
  ipmPen: number;
  percepcionIgv: number;
  subtotalAduanaPen: number;

  // Servicios locales
  serviciosUsd: number;
  igvServicios: number;
  subtotalServiciosPen: number;

  // Total costos sin margen
  totalCostosPen: number;

  // Transporte local
  subtotalTransportePen: number;

  // Margen
  margenPorcentaje: number;
  montoMargen: number;
  subtotalConMargenPen: number;

  // IGV venta
  igvVenta: number;
  totalFinalPen: number;
}

export function calcularCotizacion(
  items: ItemCotizacion[],
  tarifaFlete: TarifaFleteCal,
  costoImp: CostoImportacionCal,
  tarifaTransporte: TarifaTransporteCal | null,
  tasaCambioEurPen: number,
  tasaCambioUsdPen: number,
  margenPorcentaje: number
): DesgloseCostos {
  // ── Totales de items ────────────────────────────────────────────────────────
  const totalVolumenM3 = items.reduce(
    (acc, i) => acc + i.cantidad * i.volumen_m3_unitario,
    0
  );
  const totalPesoKg = items.reduce(
    (acc, i) => acc + i.cantidad * i.peso_kg_unitario,
    0
  );
  const subtotalMaterialEur = items.reduce(
    (acc, i) => acc + i.cantidad * i.precio_eur_unitario,
    0
  );
  const subtotalMaterialPen = subtotalMaterialEur * tasaCambioEurPen;

  // ── Flete (prorrateo por m³ del contenedor) ─────────────────────────────────
  const volMaxM3 = tarifaFlete.volumen_max_m3 || 67.5;
  const ratioVolumen = Math.min(totalVolumenM3 / volMaxM3, 1);

  const fletoOceanEur = tarifaFlete.ocean_freight_eur * ratioVolumen;
  const fleteOriginEur = tarifaFlete.origin_charge_eur * ratioVolumen;
  const fletePickupEur = tarifaFlete.pick_up_eur * ratioVolumen;

  // CIF estimado en USD para calcular seguro
  const cifEstimadoUsd = subtotalMaterialEur * (tasaCambioEurPen / tasaCambioUsdPen);
  const seguroUsd = cifEstimadoUsd * (tarifaFlete.seguro_usd / 100);

  const subtotalFleteEur = fletoOceanEur + fleteOriginEur + fletePickupEur;
  const subtotalFletePen =
    subtotalFleteEur * tasaCambioEurPen +
    seguroUsd * tasaCambioUsdPen;

  // ── Aduana ──────────────────────────────────────────────────────────────────
  const cifTotalPen = subtotalMaterialPen + subtotalFletePen;

  const adValorem = 0; // 0% para paneles de aluminio (verificar partida)
  const igvAduana = (cifTotalPen + adValorem) * (costoImp.igv_porcentaje / 100);
  const ipmPen = costoImp.ipm_pen;
  const percepcionIgv =
    (cifTotalPen + adValorem + igvAduana) *
    (costoImp.percepcion_igv_porcentaje / 100);

  const subtotalAduanaPen = adValorem + igvAduana + ipmPen + percepcionIgv;

  // ── Servicios locales ────────────────────────────────────────────────────────
  const serviciosUsd =
    costoImp.transporte_interno_usd +
    costoImp.gestion_almacen_usd +
    costoImp.visto_bueno_usd +
    costoImp.gate_in_usd +
    costoImp.gestion_operativa_usd +
    costoImp.comision_usd;

  const igvServicios = serviciosUsd * (costoImp.igv_servicios_porcentaje / 100);
  const subtotalServiciosPen =
    (serviciosUsd + igvServicios) * tasaCambioUsdPen * ratioVolumen;

  // ── Total costos (sin transporte local, sin margen) ──────────────────────────
  const totalCostosPen =
    subtotalMaterialPen +
    subtotalFletePen +
    subtotalAduanaPen +
    subtotalServiciosPen;

  // ── Transporte local ─────────────────────────────────────────────────────────
  let subtotalTransportePen = 0;
  if (tarifaTransporte) {
    subtotalTransportePen = Math.max(
      totalVolumenM3 * tarifaTransporte.precio_por_m3_pen,
      tarifaTransporte.minimo_pen
    );
  }

  // ── Margen ───────────────────────────────────────────────────────────────────
  const baseParaMargen = totalCostosPen + subtotalTransportePen;
  const montoMargen = baseParaMargen * (margenPorcentaje / 100);
  const subtotalConMargenPen = baseParaMargen + montoMargen;

  // ── IGV venta ────────────────────────────────────────────────────────────────
  const igvVenta = subtotalConMargenPen * 0.18;
  const totalFinalPen = subtotalConMargenPen + igvVenta;

  return {
    totalVolumenM3,
    totalPesoKg,
    subtotalMaterialEur,
    subtotalMaterialPen,
    fletoOceanEur,
    fleteOriginEur,
    fletePickupEur,
    seguroUsd,
    subtotalFleteEur,
    subtotalFletePen,
    adValorem,
    igvAduana,
    ipmPen,
    percepcionIgv,
    subtotalAduanaPen,
    serviciosUsd,
    igvServicios,
    subtotalServiciosPen,
    totalCostosPen,
    subtotalTransportePen,
    margenPorcentaje,
    montoMargen,
    subtotalConMargenPen,
    igvVenta,
    totalFinalPen,
  };
}
