
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WaterParameters } from '@/contexts/AquariumContext';
import { useAquarium } from '@/contexts/AquariumContext';

interface WaterTestHistoryProps {
  tankId: string;
  currentTestId?: string;
}

export function WaterTestHistory({ tankId, currentTestId }: WaterTestHistoryProps) {
  const { fetchWaterTestLogs } = useAquarium();
  const [testHistory, setTestHistory] = useState<WaterParameters[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTest, setSelectedTest] = useState<WaterParameters | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestHistory = async () => {
      setIsLoading(true);
      const logs = await fetchWaterTestLogs(tankId);
      // Filter out the current test if provided
      const filteredLogs = currentTestId 
        ? logs.filter(log => log.id !== currentTestId)
        : logs;
      setTestHistory(filteredLogs);
      setIsLoading(false);
    };

    loadTestHistory();
  }, [tankId, currentTestId, fetchWaterTestLogs]);

  if (isLoading || testHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <Button
        variant="ghost"
        className="w-full justify-between p-0 h-auto hover:bg-transparent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="text-2xl">📊</div>
          Test History ({testHistory.length} previous tests)
        </h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {testHistory.slice(0, 10).map((test) => (
            <Card
              key={test.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedTest?.id === test.id
                  ? 'ring-2 ring-blue-500 bg-blue-50/5'
                  : 'hover:bg-gray-50/5'
              }`}
              onClick={() => setSelectedTest(test.id === selectedTest?.id ? null : test)}
            >
              {/* Condensed View */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {new Date(test.date).toLocaleDateString()}
                </span>
                <div className="flex gap-4 text-sm">
                  <span>pH: {test.ph}</span>
                  <span>Sal: {test.salinity}</span>
                  <span>Temp: {test.temperature}°F</span>
                  <span>NH₃: {test.ammonia}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTest?.id === test.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Nitrite</span>
                      <p className="font-medium">{test.nitrite || 0}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Nitrate</span>
                      <p className="font-medium">{test.nitrate || 0}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">KH</span>
                      <p className="font-medium">{test.kh || 0}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Calcium</span>
                      <p className="font-medium">{test.calcium || 0}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Magnesium</span>
                      <p className="font-medium">{test.magnesium || 0}</p>
                    </div>
                  </div>
                  
                  {test.aiInsights && (
                    <div className="mt-4 p-3 bg-blue-50/10 rounded-lg">
                      <p className="text-sm font-medium text-blue-600 mb-1">AI Insights</p>
                      <p className="text-sm text-muted-foreground">{test.aiInsights}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
