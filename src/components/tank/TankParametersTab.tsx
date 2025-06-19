
import React from 'react';
import { WaterParameters } from '@/contexts/AquariumContext';
import ParameterChart from './ParameterChart';
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
    <div className="space-y-4">
      {/* Parameter Chart */}
      <ParameterChart parameters={parameters} />
      
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
