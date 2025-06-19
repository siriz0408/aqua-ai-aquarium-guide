
import React from 'react';
import { ParameterTooltip } from '@/components/ui/parameter-tooltip';

export const ReefChemistryLegend: React.FC = () => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
        <ParameterTooltip
          parameter="Calcium (Ca)"
          normalRange="380 - 450 ppm"
          description="Essential for coral skeleton formation and shell development. Works closely with alkalinity and magnesium."
        >
          <span className="cursor-help">Calcium (380-450 ppm)</span>
        </ParameterTooltip>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
        <ParameterTooltip
          parameter="Alkalinity (KH)"
          normalRange="8 - 12 dKH"
          description="Measures carbonate buffering capacity. Critical for coral calcification and pH stability."
        >
          <span className="cursor-help">Alkalinity (8-12 dKH)</span>
        </ParameterTooltip>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-teal-600"></div>
        <ParameterTooltip
          parameter="Magnesium (Mg)"
          normalRange="1250 - 1350 ppm"
          description="Supports calcium and alkalinity balance. Prevents precipitation and aids coral growth."
        >
          <span className="cursor-help">Magnesium (1250-1350 ppm)</span>
        </ParameterTooltip>
      </div>
      <div className="flex items-center gap-2 col-span-1">
        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-purple-500"></div>
        <ParameterTooltip
          parameter="Ca/Alk Balance"
          normalRange="~1.0 ratio"
          description="Ideal calcium to alkalinity ratio helps maintain stable reef chemistry. Ca ÷ (Alk × 20) should be close to 1.0."
        >
          <span className="cursor-help">Ca/Alk Balance</span>
        </ParameterTooltip>
      </div>
    </div>
  );
};
