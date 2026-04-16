"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User, Package, Calculator, CheckCircle2,
  Plus, Trash2, Loader2, ChevronRight, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, formatNumber, ZONAS_TRANSPORTE } from "@/lib/utils";
import { calcularCotizacion, type ItemCotizacion } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/client";
import { getBCRPRates } from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  clientes: { id: string; nombre: string; empresa: string | null }[];
  productos: {
    id: string; sku: string; nombre: string; unidad: string;
    precio_eur_unitario: number; volumen_m3_unitario: number;
    peso_kg_unitario: number; stock_actual: number;
  }[];
  tarifaFlete: any | null;
  costoImportacion: any | null;
  tarifasTransporte: any[];
  clienteIdInicial?: string;
}

// ─── Steps indicator ──────────────────────────────────────────────────────────
const STEPS = [
  { label: "Cliente & Obra", icon: User },
  { label: "Productos", icon: Package },
  { label: "Costos y Margen", icon: Calculator },
  { label: "Confirmar", icon: CheckCircle2 },
];

function StepHeader({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                active && "bg-primary text-primary-foreground shadow",
                done && "bg-muted text-muted-foreground",
                !active && !done && "text-muted-foreground/50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Cost row ────────────────────────────────────────────────────────────────
function CostRow({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-lg",
      highlight ? "bg-primary/10 font-semibold" : "hover:bg-muted/30"
    )}>
      <div>
        <p className={cn("text-sm", highlight ? "text-primary font-semibold" : "text-muted-foreground")}>{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60">{sub}</p>}
      </div>
      <p className={cn("text-sm font-mono", highlight ? "text-primary font-bold text-base" : "")}>{value}</p>
    </div>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────
export function NuevaCotizacionWizard({
  clientes, productos, tarifaFlete, costoImportacion,
  tarifasTransporte, clienteIdInicial,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1 state
  const [clienteId, setClienteId] = useState(clienteIdInicial ?? "");
  const [direccionObra, setDireccionObra] = useState("");
  const [zonaTransporte, setZonaTransporte] = useState("");
  const [notas, setNotas] = useState("");

  // Step 2 state
  const [items, setItems] = useState<(ItemCotizacion & { productoId: string; nombre: string; sku: string; unidad: string })[]>([]);
  const [productoSelId, setProductoSelId] = useState("");
  const [cantidadInput, setCantidadInput] = useState("1");

  // Step 3 state
  const [tasaEurPen, setTasaEurPen] = useState(3.85);
  const [tasaUsdPen, setTasaUsdPen] = useState(3.75);
  const [margen, setMargen] = useState(20);

  // ─── Fetch BCRP Rates ──────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTasas() {
      try {
        const data = await getBCRPRates();
        if (data) {
          if (data.eur) setTasaEurPen(data.eur);
          if (data.usd) setTasaUsdPen(data.usd);
          toast.success(`Se aplicó el tipo de cambio del BCRP al cierre del ${data.date}.`);
        }
      } catch (err) {
        console.error("BCRP Fetch Error", err);
      }
    }
    fetchTasas();
  }, []);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const tarifaTransporte = useMemo(() => {
    if (!zonaTransporte) return null;
    return tarifasTransporte.find((t) => t.zona === zonaTransporte) ?? null;
  }, [zonaTransporte, tarifasTransporte]);

  const desglose = useMemo(() => {
    if (!tarifaFlete || !costoImportacion || items.length === 0) return null;
    return calcularCotizacion(
      items,
      tarifaFlete,
      costoImportacion,
      tarifaTransporte,
      tasaEurPen,
      tasaUsdPen,
      margen
    );
  }, [items, tarifaFlete, costoImportacion, tarifaTransporte, tasaEurPen, tasaUsdPen, margen]);

  // ─── Add product to list ───────────────────────────────────────────────────
  const addItem = () => {
    const prod = productos.find((p) => p.id === productoSelId);
    if (!prod) { toast.error("Selecciona un producto"); return; }
    const cant = parseFloat(cantidadInput) || 0;
    if (cant <= 0) { toast.error("Cantidad inválida"); return; }

    setItems((prev) => {
      const exists = prev.findIndex((i) => i.producto_id === prod.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = { ...updated[exists], cantidad: updated[exists].cantidad + cant };
        return updated;
      }
      return [...prev, {
        producto_id: prod.id,
        productoId: prod.id,
        nombre: prod.nombre,
        sku: prod.sku,
        unidad: prod.unidad,
        cantidad: cant,
        precio_eur_unitario: prod.precio_eur_unitario,
        volumen_m3_unitario: prod.volumen_m3_unitario,
        peso_kg_unitario: prod.peso_kg_unitario,
      }];
    });
    setProductoSelId("");
    setCantidadInput("1");
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Save quote ────────────────────────────────────────────────────────────
  const guardar = async (estado: "borrador" | "enviada") => {
    if (!desglose) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sesión expirada"); setSaving(false); return; }

    // Insert cotizacion
    const { data: cot, error: errCot } = await supabase.from("cotizaciones").insert({
      cliente_id: clienteId,
      usuario_id: user.id,
      numero_cotizacion: "",
      direccion_obra: direccionObra || null,
      zona_transporte: zonaTransporte || null,
      estado,
      tasa_cambio_eur_pen: tasaEurPen,
      total_volumen_m3: desglose.totalVolumenM3,
      total_peso_kg: desglose.totalPesoKg,
      subtotal_material_pen: desglose.subtotalMaterialPen,
      subtotal_flete_pen: desglose.subtotalFletePen,
      subtotal_aduana_pen: desglose.subtotalAduanaPen,
      subtotal_transporte_local_pen: desglose.subtotalTransportePen,
      margen_porcentaje: margen,
      subtotal_con_margen_pen: desglose.subtotalConMargenPen,
      igv_venta_pen: desglose.igvVenta,
      total_final_pen: desglose.totalFinalPen,
      notas: notas || null,
      validez_dias: 30,
    }).select("id, numero_cotizacion").single();

    if (errCot || !cot) {
      toast.error("Error al guardar: " + errCot?.message);
      setSaving(false);
      return;
    }

    // Insert detalles
    const detalles = items.map((item) => ({
      cotizacion_id: cot.id,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_eur_snapshot: item.precio_eur_unitario,
      volumen_m3_snapshot: item.volumen_m3_unitario,
      peso_kg_snapshot: item.peso_kg_unitario,
      subtotal_material_pen: item.cantidad * item.precio_eur_unitario * tasaEurPen,
    }));

    const { error: errDet } = await supabase.from("detalles_cotizacion").insert(detalles);
    if (errDet) {
      toast.error("Error en detalles: " + errDet.message);
      setSaving(false);
      return;
    }

    toast.success(`Cotización ${cot.numero_cotizacion} creada`);
    router.push(`/dashboard/cotizaciones/${cot.id}`);
    router.refresh();
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6 border-b">
        <StepHeader current={step} />
      </div>

      <div className="p-6">
        {/* ── STEP 0: Cliente & Obra ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5 max-w-xl">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.empresa ? `${c.empresa} — ${c.nombre}` : c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="direccion_obra">Dirección de la obra</Label>
              <Input
                id="direccion_obra"
                placeholder="Av. La Marina 2400, San Miguel"
                value={direccionObra}
                onChange={(e) => setDireccionObra(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Zona de transporte</Label>
              <Select value={zonaTransporte} onValueChange={setZonaTransporte}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona..." />
                </SelectTrigger>
                <SelectContent>
                  {ZONAS_TRANSPORTE.map((z) => (
                    <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notas_cot">Notas internas</Label>
              <Textarea
                id="notas_cot"
                placeholder="Observaciones del proyecto..."
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: Productos ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Agregar producto */}
            <div className="flex gap-3 flex-wrap items-end p-4 rounded-lg bg-muted/30 border">
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <Label>Producto</Label>
                <Select value={productoSelId} onValueChange={setProductoSelId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre} <span className="text-muted-foreground ml-1 text-xs">({p.sku})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28 space-y-1.5">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={cantidadInput}
                  onChange={(e) => setCantidadInput(e.target.value)}
                />
              </div>
              <Button type="button" variant="brand" onClick={addItem}>
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            </div>

            {/* Items table */}
            {items.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Producto</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Cant.</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">P. EUR</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Total EUR</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Vol. m³</th>
                      <th className="px-2 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <p className="font-medium">{item.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {formatNumber(item.cantidad, 2)} {item.unidad}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          € {formatNumber(item.precio_eur_unitario)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          € {formatNumber(item.cantidad * item.precio_eur_unitario)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {formatNumber(item.cantidad * item.volumen_m3_unitario, 3)}
                        </td>
                        <td className="px-2 py-3">
                          <button onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/20 font-semibold">
                      <td className="px-4 py-3" colSpan={3}>Total</td>
                      <td className="px-4 py-3 text-right font-mono">
                        € {formatNumber(items.reduce((a, i) => a + i.cantidad * i.precio_eur_unitario, 0))}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatNumber(items.reduce((a, i) => a + i.cantidad * i.volumen_m3_unitario, 0), 3)} m³
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border-2 border-dashed border-border">
                <Package className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Agrega al menos un producto</p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Costos y Margen ────────────────────────────────────── */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: config */}
            <div className="space-y-5">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Parámetros de cálculo
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tasa_eur">Tasa EUR → PEN</Label>
                  <Input
                    id="tasa_eur"
                    type="number"
                    step="0.01"
                    value={tasaEurPen}
                    onChange={(e) => setTasaEurPen(parseFloat(e.target.value) || 3.85)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tasa_usd">Tasa USD → PEN</Label>
                  <Input
                    id="tasa_usd"
                    type="number"
                    step="0.01"
                    value={tasaUsdPen}
                    onChange={(e) => setTasaUsdPen(parseFloat(e.target.value) || 3.75)}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="margen_pct">Margen de ganancia (%)</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="margen_pct"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={margen}
                      onChange={(e) => setMargen(parseInt(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-14 text-center font-bold text-lg text-primary">{margen}%</span>
                  </div>
                </div>
              </div>

              {!tarifaFlete && (
                <div className="p-4 rounded-lg bg-brand-orange/10 border border-brand-orange/30 text-sm text-brand-orange">
                  ⚠️ No hay tarifa de flete activa. Configura una en Costos → Tarifas de Flete.
                </div>
              )}
              {!costoImportacion && (
                <div className="p-4 rounded-lg bg-brand-orange/10 border border-brand-orange/30 text-sm text-brand-orange">
                  ⚠️ No hay costos de importación activos.
                </div>
              )}
            </div>

            {/* Right: desglose */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Desglose de costos
              </h3>
              {desglose ? (
                <div className="space-y-1">
                  <div className="p-3 rounded-lg bg-muted/30 mb-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-muted-foreground">Volumen total</div>
                    <div className="text-right font-mono font-semibold">{formatNumber(desglose.totalVolumenM3, 3)} m³</div>
                    <div className="text-muted-foreground">Peso total</div>
                    <div className="text-right font-mono font-semibold">{formatNumber(desglose.totalPesoKg, 1)} kg</div>
                  </div>
                  <CostRow label="Material (EUR→PEN)" value={formatCurrency(desglose.subtotalMaterialPen)} sub={`€ ${formatNumber(desglose.subtotalMaterialEur)}`} />
                  <CostRow label="Flete internacional" value={formatCurrency(desglose.subtotalFletePen)} sub={`€ ${formatNumber(desglose.subtotalFleteEur)} + seguro`} />
                  <CostRow label="Derechos aduaneros" value={formatCurrency(desglose.subtotalAduanaPen)} sub="IGV, IPM, Percepción" />
                  <CostRow label="Servicios logísticos" value={formatCurrency(desglose.subtotalServiciosPen)} sub="Almacén, gate in, gestión" />
                  {desglose.subtotalTransportePen > 0 && (
                    <CostRow label="Transporte local" value={formatCurrency(desglose.subtotalTransportePen)} sub={ZONAS_TRANSPORTE.find(z => z.value === zonaTransporte)?.label} />
                  )}
                  <div className="h-px bg-border my-2" />
                  <CostRow label="Subtotal costos" value={formatCurrency(desglose.totalCostosPen + desglose.subtotalTransportePen)} />
                  <CostRow label={`Margen ${margen}%`} value={`+ ${formatCurrency(desglose.montoMargen)}`} />
                  <div className="h-px bg-border my-2" />
                  <CostRow label="Subtotal con margen" value={formatCurrency(desglose.subtotalConMargenPen)} />
                  <CostRow label="IGV venta 18%" value={`+ ${formatCurrency(desglose.igvVenta)}`} />
                  <div className="h-px bg-primary/30 my-2" />
                  <CostRow label="TOTAL FINAL" value={formatCurrency(desglose.totalFinalPen)} highlight />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center rounded-lg bg-muted/20 border border-dashed">
                  <Calculator className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Agrega productos para ver el cálculo</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirmar ──────────────────────────────────────────── */}
        {step === 3 && desglose && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
              <h3 className="font-semibold">Resumen de la cotización</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-muted-foreground">Cliente</div>
                <div className="font-medium">{clientes.find(c => c.id === clienteId)?.empresa || clientes.find(c => c.id === clienteId)?.nombre}</div>
                <div className="text-muted-foreground">Dirección obra</div>
                <div className="font-medium">{direccionObra || "—"}</div>
                <div className="text-muted-foreground">Zona transporte</div>
                <div className="font-medium">{ZONAS_TRANSPORTE.find(z => z.value === zonaTransporte)?.label || "—"}</div>
                <div className="text-muted-foreground">Productos</div>
                <div className="font-medium">{items.length} líneas</div>
                <div className="text-muted-foreground">Volumen total</div>
                <div className="font-medium">{formatNumber(desglose.totalVolumenM3, 3)} m³</div>
                <div className="text-muted-foreground">Margen</div>
                <div className="font-medium text-brand-green">{margen}%</div>
              </div>
            </div>

            <div className="rounded-xl border bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 border-brand-purple/20 p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total final con IGV</p>
              <p className="text-4xl font-bold text-gradient-brand">{formatCurrency(desglose.totalFinalPen)}</p>
              <p className="text-xs text-muted-foreground mt-2">Válido por 30 días desde la fecha de emisión</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="p-6 border-t flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || saving}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-3">
          {step < 3 ? (
            <Button
              variant="brand"
              onClick={() => {
                if (step === 0 && !clienteId) { toast.error("Selecciona un cliente"); return; }
                if (step === 1 && items.length === 0) { toast.error("Agrega al menos un producto"); return; }
                setStep((s) => s + 1);
              }}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => guardar("borrador")}
                disabled={saving || !desglose}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Guardar borrador
              </Button>
              <Button
                variant="brand"
                onClick={() => guardar("enviada")}
                disabled={saving || !desglose}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Guardar y enviar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
