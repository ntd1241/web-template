export interface Currency {
  code: string;
  nameVi: string;
  nameEn: string;
  symbol: string;
  minorUnit: number;
  isActive: boolean;
  sortOrder: number;
}

export interface CurrencyOption {
  value: string;
  label: string;
}

export function mapCurrencyRow(row: {
  code: string;
  name_vi: string;
  name_en: string;
  symbol: string;
  minor_unit: number;
  is_active: boolean;
  sort_order: number;
}): Currency {
  return {
    code: row.code,
    nameVi: row.name_vi,
    nameEn: row.name_en,
    symbol: row.symbol,
    minorUnit: row.minor_unit,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function toCurrencyOptions(currencies: Currency[]): CurrencyOption[] {
  return currencies
    .filter((currency) => currency.isActive)
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.code.localeCompare(right.code),
    )
    .map((currency) => ({
      value: currency.code,
      label: `${currency.code} - ${currency.nameVi}`,
    }));
}
