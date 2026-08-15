export interface CountryOption {
  value: string;
  label: string;
  flag?: string;
}

export const COUNTRY_OPTIONS: readonly CountryOption[] = [
  { value: 'VN', label: 'Việt Nam', flag: 'vietnam' },
  { value: 'US', label: 'Hoa Kỳ', flag: 'united-states' },
  { value: 'JP', label: 'Nhật Bản', flag: 'japan' },
  { value: 'KR', label: 'Hàn Quốc', flag: 'south-korea' },
  { value: 'CN', label: 'Trung Quốc', flag: 'china' },
  { value: 'SG', label: 'Singapore', flag: 'singapore' },
  { value: 'TH', label: 'Thái Lan', flag: 'thailand' },
  { value: 'MY', label: 'Malaysia', flag: 'malaysia' },
  { value: 'AU', label: 'Úc', flag: 'australia' },
  { value: 'GB', label: 'Vương quốc Anh', flag: 'united-kingdom' },
  { value: 'DE', label: 'Đức', flag: 'germany' },
  { value: 'FR', label: 'Pháp', flag: 'france' },
  { value: 'CA', label: 'Canada', flag: 'canada' },
  { value: 'IN', label: 'Ấn Độ', flag: 'india' },
  { value: 'ID', label: 'Indonesia', flag: 'indonesia' },
  { value: 'PH', label: 'Philippines', flag: 'philippines' },
  { value: 'TW', label: 'Đài Loan', flag: 'taiwan' },
  { value: 'HK', label: 'Hồng Kông', flag: 'hong-kong' },
  {
    value: 'AE',
    label: 'Các Tiểu vương quốc Ả Rập Thống nhất',
    flag: 'united-arab-emirates',
  },
  { value: 'IT', label: 'Ý', flag: 'italy' },
  { value: 'ES', label: 'Tây Ban Nha', flag: 'spain' },
  { value: 'RU', label: 'Nga', flag: 'russia' },
  { value: 'BR', label: 'Brazil', flag: 'brazil' },
  { value: 'CH', label: 'Thụy Sĩ', flag: 'switzerland' },
  { value: 'SE', label: 'Thụy Điển', flag: 'sweden' },
  { value: 'NZ', label: 'New Zealand', flag: 'new-zealand' },
];

export function getCountryFlagName(countryCode: string): string {
  return (
    COUNTRY_OPTIONS.find((option) => option.value === countryCode)?.flag ??
    countryCode.toLowerCase()
  );
}
