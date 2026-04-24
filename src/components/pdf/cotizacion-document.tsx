import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import { formatNumber } from "@/lib/utils";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, padding: 40, backgroundColor: "#ffffff", color: "#1a1a2e" },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#844ea3" },
  brandBox: { flexDirection: "column" },
  brandName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#844ea3" },
  brandSub: { fontSize: 8, color: "#888", marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  quoteNum: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1d3a84" },
  quoteDate: { fontSize: 8, color: "#666", marginTop: 4 },
  stateBadge: { marginTop: 6, backgroundColor: "#844ea3", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  stateBadgeText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold" },
  // Info sections
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  infoBox: { flex: 1, backgroundColor: "#f8f6fb", borderRadius: 6, padding: 10, borderLeftWidth: 3, borderLeftColor: "#844ea3" },
  infoTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#844ea3", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 },
  infoText: { fontSize: 8.5, color: "#333", lineHeight: 1.4 },
  infoSmall: { fontSize: 7.5, color: "#666", marginTop: 2 },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#1d3a84", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 1 },
  tableHeaderText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold" },
  tableRow: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: "#e8e8f0" },
  tableRowAlt: { backgroundColor: "#f9f8fc" },
  cell1: { flex: 3 },
  cell2: { flex: 1, textAlign: "right" },
  cell3: { flex: 1, textAlign: "right" },
  cell4: { flex: 1.5, textAlign: "right" },
  colText: { fontSize: 8.5, color: "#333" },
  colTextSub: { fontSize: 7, color: "#888", marginTop: 1 },
  colTextRight: { fontSize: 8.5, color: "#333", textAlign: "right" },
  // Cost breakdown
  breakdownSection: { marginTop: 16 },
  breakdownTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1d3a84", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
  breakdownLabel: { fontSize: 8.5, color: "#555" },
  breakdownValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#333" },
  breakdownDivider: { borderTopWidth: 1, borderTopColor: "#ddd", marginVertical: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, backgroundColor: "#844ea3", borderRadius: 6, paddingHorizontal: 10, marginTop: 6 },
  totalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#fff" },
  totalValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#fff" },
  // Footer
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e0d9ea", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#999" },
  validezBox: { backgroundColor: "#fff8e6", borderRadius: 6, padding: 10, marginTop: 16, borderWidth: 1, borderColor: "#fabf2a" },
  validezText: { fontSize: 8, color: "#b88a00" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pen = (v: number) =>
  `S/ ${formatNumber(v)}`;

// ─── Component ────────────────────────────────────────────────────────────────
export function CotizacionPDF({ cotizacion: cot }: { cotizacion: any }) {
  const cliente = cot.clientes;
  const detalles: any[] = cot.detalles_cotizacion ?? [];
  const fechaEmision = new Date(cot.created_at).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  const fechaVence = new Date(
    new Date(cot.created_at).getTime() + cot.validez_dias * 86400000
  ).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document title={`Cotización ${cot.numero_cotizacion}`} author="AppQuote">
      <Page size="A4" style={S.page}>
        {/* ── Header ── */}
        <View style={S.header}>
          <View style={S.brandBox}>
            <Text style={S.brandName}>AppQuote</Text>
            <Text style={S.brandSub}>Paneles para Fachadas · Importación Europa</Text>
            <Text style={[S.brandSub, { marginTop: 6 }]}>Lima, Perú · contacto@appquote.pe</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.quoteNum}>{cot.numero_cotizacion}</Text>
            <Text style={S.quoteDate}>Emitida: {fechaEmision}</Text>
            <View style={S.stateBadge}>
              <Text style={S.stateBadgeText}>{cot.estado.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ── Client / Obra info ── */}
        <View style={S.infoRow}>
          <View style={S.infoBox}>
            <Text style={S.infoTitle}>Cliente</Text>
            <Text style={S.infoText}>{cliente?.nombre}</Text>
            {cliente?.empresa && <Text style={S.infoSmall}>{cliente.empresa}</Text>}
            {cliente?.ruc && <Text style={S.infoSmall}>RUC: {cliente.ruc}</Text>}
            {cliente?.email && <Text style={S.infoSmall}>{cliente.email}</Text>}
            {cliente?.telefono && <Text style={S.infoSmall}>{cliente.telefono}</Text>}
          </View>
          <View style={S.infoBox}>
            <Text style={S.infoTitle}>Obra</Text>
            <Text style={S.infoText}>{cot.direccion_obra || "Sin especificar"}</Text>
            {cot.zona_transporte && (
              <Text style={S.infoSmall}>Zona: {cot.zona_transporte.replace("_", " ")}</Text>
            )}
            <Text style={[S.infoSmall, { marginTop: 8 }]}>
              Tasa cambio EUR/PEN: {formatNumber(cot.tasa_cambio_eur_pen, 3)} (Ref. al {fechaEmision})
            </Text>
          </View>
        </View>

        {/* ── Products table ── */}
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderText, S.cell1]}>Producto / SKU</Text>
          <Text style={[S.tableHeaderText, S.cell2]}>Cantidad</Text>
          <Text style={[S.tableHeaderText, S.cell3]}>P. Unit EUR</Text>
          <Text style={[S.tableHeaderText, S.cell4]}>Subtotal PEN</Text>
        </View>
        {detalles.map((det: any, i: number) => (
          <View key={det.id} style={[S.tableRow, i % 2 !== 0 ? S.tableRowAlt : {}]}>
            <View style={S.cell1}>
              <Text style={S.colText}>{det.productos?.nombre}</Text>
              <Text style={S.colTextSub}>{det.productos?.sku}</Text>
            </View>
            <Text style={[S.colTextRight, S.cell2]}>
              {formatNumber(det.cantidad, 2)} {det.productos?.unidad}
            </Text>
            <Text style={[S.colTextRight, S.cell3]}>€ {formatNumber(det.precio_eur_snapshot)}</Text>
            <Text style={[S.colTextRight, S.cell4]}>{pen(det.subtotal_material_pen)}</Text>
          </View>
        ))}

        {/* ── Cost breakdown ── */}
        <View style={{ flexDirection: "row", gap: 16, marginTop: 24 }}>
          {/* Left: volumes */}
          <View style={{ flex: 1 }}>
            <Text style={S.breakdownTitle}>Volúmenes del pedido</Text>
            {[
              { l: "Volumen total", v: `${formatNumber(cot.total_volumen_m3, 3)} m³` },
              { l: "Peso total", v: `${formatNumber(cot.total_peso_kg, 1)} kg` },
              { l: "Margen de ganancia", v: `${cot.margen_porcentaje}%` },
            ].map((row) => (
              <View key={row.l} style={S.breakdownRow}>
                <Text style={S.breakdownLabel}>{row.l}</Text>
                <Text style={S.breakdownValue}>{row.v}</Text>
              </View>
            ))}
          </View>

          {/* Right: pricing */}
          <View style={{ flex: 1.5 }}>
            <Text style={S.breakdownTitle}>Estructura de precios</Text>
            {[
              { l: "Material", v: pen(cot.subtotal_material_pen) },
              { l: "Flete internacional", v: pen(cot.subtotal_flete_pen) },
              { l: "Derechos aduana", v: pen(cot.subtotal_aduana_pen) },
              { l: "Transporte local", v: pen(cot.subtotal_transporte_local_pen) },
            ].map((row) => (
              <View key={row.l} style={S.breakdownRow}>
                <Text style={S.breakdownLabel}>{row.l}</Text>
                <Text style={S.breakdownValue}>{row.v}</Text>
              </View>
            ))}
            <View style={S.breakdownDivider} />
            <View style={S.breakdownRow}>
              <Text style={S.breakdownLabel}>Subtotal + margen {cot.margen_porcentaje}%</Text>
              <Text style={S.breakdownValue}>{pen(cot.subtotal_con_margen_pen)}</Text>
            </View>
            <View style={S.breakdownRow}>
              <Text style={S.breakdownLabel}>IGV 18%</Text>
              <Text style={S.breakdownValue}>+ {pen(cot.igv_venta_pen)}</Text>
            </View>
            <View style={S.totalRow}>
              <Text style={S.totalLabel}>TOTAL FINAL</Text>
              <Text style={S.totalValue}>{pen(cot.total_final_pen)}</Text>
            </View>
          </View>
        </View>

        {/* Validez */}
        <View style={S.validezBox}>
          <Text style={S.validezText}>
            ⏱ Esta cotización tiene una validez de {cot.validez_dias} días a partir de la fecha de emisión (vence el {fechaVence}).
          </Text>
          <Text style={[S.validezText, { marginTop: 4 }]}>
            * Los precios en soles fueron calculados con el tipo de cambio EUR/PEN de {formatNumber(cot.tasa_cambio_eur_pen, 3)} (referencial al {fechaEmision}).
            Están sujetos a variación de tipo de cambio después de esta fecha.
          </Text>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>AppQuote — Sistema de Cotizaciones · Lima, Perú</Text>
          <Text style={S.footerText}>{cot.numero_cotizacion} · {fechaEmision}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
