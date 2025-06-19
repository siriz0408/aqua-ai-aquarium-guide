
export interface ReefChemistryData {
  date: string;
  displayDate: string;
  calcium: number | null;
  kh: number | null;
  magnesium: number | null;
  caAlkRatio: number | null;
}

export interface ReefChemistryChartProps {
  parameters: any[];
  title?: string;
}
