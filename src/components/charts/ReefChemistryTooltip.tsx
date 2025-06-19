
import React from 'react';
import { format } from 'date-fns';

interface ReefChemistryTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const ReefChemistryTooltip: React.FC<ReefChemistryTooltipProps> = ({ 
  active, 
  payload, 
  label 
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{format(new Date(label), 'MMM dd, yyyy')}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === 'caAlkRatio') {
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                Ca/Alk Ratio: {entry.value !== null ? entry.value.toFixed(2) : 'N/A'}
              </p>
            );
          }
          return (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value !== null ? entry.value.toFixed(1) : 'N/A'}
              {entry.dataKey === 'kh' ? ' dKH' : ' ppm'}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};
