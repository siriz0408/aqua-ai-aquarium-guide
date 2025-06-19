
import React from 'react';
import { WaterParameters } from '@/contexts/AquariumContext';
import ParameterChart from './ParameterChart';
import ReefChemistryChart from '../charts/ReefChemistryChart';
import WaterTestResultsTable from '@/components/WaterTestResultsTable';

interface TankParametersTabProps {
  parameters: WaterParameters[];
  onDeleteTest: (testId: string) => void;
  onSendToChat: (test: WaterParameters) => void;
}

const TankParametersTab: React.FC<TankParametersTabProps> = ({
  parameters,
  onDeleteTest,
  onSendToChat,
}) => {
  return (
    <div className="space-y-6">
      {/* Essential Water Parameters Chart */}
      <ParameterChart parameters={parameters} title="Essential Water Parameters" />
      
      {/* Reef Chemistry Chart */}
      <ReefChemistryChart parameters={parameters} />
      
      {/* Parameter Table */}
      <WaterTestResultsTable
        tests={parameters}
        onDeleteTest={onDeleteTest}
        onSendToChat={onSendToChat}
      />
    </div>
  );
};

export default TankParametersTab;
