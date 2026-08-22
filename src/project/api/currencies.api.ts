import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import { mapCurrencyRow, type Currency } from '../model/currency';

interface CurrencyRow {
  code: string;
  name_vi: string;
  name_en: string;
  symbol: string;
  minor_unit: number;
  is_active: boolean;
  sort_order: number;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

export async function loadActiveCurrencies(): Promise<Currency[]> {
  assertSupabaseConfigured();

  const rows = (await supabaseApi.get(
    '/currencies',
    queryParams({
      select: 'code,name_vi,name_en,symbol,minor_unit,is_active,sort_order',
      is_active: 'eq.true',
      order: 'sort_order.asc,code.asc',
    }),
  )) as CurrencyRow[];

  return rows.map(mapCurrencyRow);
}
