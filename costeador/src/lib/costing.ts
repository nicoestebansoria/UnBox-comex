// Cálculo de costeo compartido entre el servidor (tRPC) y la versión estática del cliente.

export type CostingItem = {
  sku: string; description: string; ncmCode?: string; quantity: number; fobUnit: number;
  importDutyPct: number; statisticalFeePct: number; statisticalFeeMaxPct: number; countryTaxPct: number; internalTaxPct: number;
  vatPct: number; additionalVatPct: number; incomeTaxPct: number; iibbPct: number; grossIncomePct: number; weightKg: number;
};

export type CostingInput = {
  items: CostingItem[];
  totalWeightKg: number; fletePerKg: number;
  expenses: { origin: number; local: number; terminal: number; internalFreight: number; extraordinary: number };
  despachantePct: number; gestionAduaneraPct: number; skipAdditionalVat: boolean; skipIncomeTax: boolean; skipIibb: boolean;
  insuranceMode: "rate" | "manual" | "rate_plus_manual"; insuranceRatePct: number; manualInsuranceTotal: number;
};

export function calculateCosting(input: CostingInput) {
  const totalFob = input.items.reduce((sum, item) => sum + item.quantity * item.fobUnit, 0);
  const totalWeight = input.totalWeightKg || input.items.reduce((sum, item) => sum + item.quantity * item.weightKg, 0);
  const fleteTotal = input.fletePerKg * totalWeight;
  const despachanteTotal = input.despachantePct > 0 ? Math.max(totalFob * input.despachantePct / 100, 250) : 0;
  const gestionAduaneraTotal = totalFob * input.gestionAduaneraPct / 100;
  const share = (amount: number, item: CostingItem) => totalFob > 0 && item.quantity > 0 ? amount * (item.quantity * item.fobUnit / totalFob) / item.quantity : 0;
  const rows = input.items.map((item) => {
    const flete = share(fleteTotal, item);
    const origin = share(input.expenses.origin, item);
    const local = share(input.expenses.local, item);
    const rateInsurance = (item.fobUnit + flete + origin + local) * input.insuranceRatePct / 100;
    const manualInsurance = share(input.manualInsuranceTotal, item);
    const insurance = input.insuranceMode === "manual" ? manualInsurance : input.insuranceMode === "rate_plus_manual" ? rateInsurance + manualInsurance : rateInsurance;
    const customsValue = item.fobUnit + flete + insurance;
    const customsBase = customsValue + origin + local;
    const duty = customsBase * item.importDutyPct / 100;
    const statisticalRaw = customsBase * item.statisticalFeePct / 100;
    const statistical = item.statisticalFeeMaxPct > 0 ? Math.min(statisticalRaw, customsBase * item.statisticalFeeMaxPct / 100) : statisticalRaw;
    const countryTax = customsBase * item.countryTaxPct / 100;
    const internalTax = customsBase * item.internalTaxPct / 100;
    const customsTotal = customsBase + duty + statistical + countryTax + internalTax;
    // ARCA/SIM: Valor en Aduana = FOB + flete + seguro +/- ajustes aduaneros.
    // En este prototipo los ajustes se incorporarán cuando se cargue el documento; por ahora son cero.
    const declared = customsValue;
    const vat = (item.vatPct + (input.skipAdditionalVat ? 0 : item.additionalVatPct)) / 100 * (declared + duty + statistical);
    const incomeTax = input.skipIncomeTax ? 0 : declared * item.incomeTaxPct / 100;
    const iibb = input.skipIibb ? 0 : declared * item.iibbPct / 100;
    const grossIncome = incomeTax + iibb;
    const terminal = share(input.expenses.terminal, item);
    const despachante = share(despachanteTotal, item);
    const gestionAduanera = share(gestionAduaneraTotal, item);
    const internalFreight = share(input.expenses.internalFreight, item);
    const extraordinary = share(input.expenses.extraordinary, item);
    const finalUnit = customsTotal + vat + grossIncome + terminal + despachante + gestionAduanera + internalFreight + extraordinary;
    return { ...item, flete, origin, local, insurance, customsBase, duty, statistical, countryTax, internalTax, customsTotal, declared, vat, incomeTax, iibb, grossIncome, terminal, despachante, gestionAduanera, internalFreight, extraordinary, finalUnit, increasePct: item.fobUnit > 0 ? (finalUnit - item.fobUnit) / item.fobUnit * 100 : 0 };
  });
  const insuranceTotal = rows.reduce((sum, row) => sum + row.insurance * row.quantity, 0);
  const customsValueTotal = totalFob + fleteTotal + insuranceTotal;
  return { totalFob, fleteTotal, insuranceTotal, despachanteTotal, gestionAduaneraTotal, customsValueTotal, totalFinal: rows.reduce((sum, row) => sum + row.finalUnit * row.quantity, 0), rows };
}
