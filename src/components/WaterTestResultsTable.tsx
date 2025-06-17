
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { WaterParameters } from '@/contexts/AquariumContext';
import { MoreHorizontal, Trash2, MessageSquare, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WaterTestResultsTableProps {
  tests: WaterParameters[];
  onDeleteTest: (testId: string) => void;
  onSendToChat: (test: WaterParameters) => void;
}

const WaterTestResultsTable: React.FC<WaterTestResultsTableProps> = ({
  tests,
  onDeleteTest,
  onSendToChat
}) => {
  const { toast } = useToast();

  const getParameterStatus = (parameter: string, value: number) => {
    // Basic parameter ranges for saltwater aquariums
    const ranges = {
      ph: { min: 8.0, max: 8.4, optimal: { min: 8.1, max: 8.3 } },
      salinity: { min: 1.020, max: 1.026, optimal: { min: 1.023, max: 1.025 } },
      temperature: { min: 72, max: 82, optimal: { min: 74, max: 78 } },
      ammonia: { min: 0, max: 0.25, optimal: { min: 0, max: 0 } },
      nitrite: { min: 0, max: 0.5, optimal: { min: 0, max: 0 } },
      nitrate: { min: 0, max: 20, optimal: { min: 0, max: 10 } },
    };

    const range = ranges[parameter as keyof typeof ranges];
    if (!range) return 'neutral';

    if (value < range.min || value > range.max) return 'danger';
    if (value >= range.optimal.min && value <= range.optimal.max) return 'good';
    return 'warning';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Caution</Badge>;
      case 'danger':
        return <Badge variant="destructive">Alert</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const analyzeTest = (test: WaterParameters) => {
    const issues = [];
    const good = [];
    
    if (test.ph < 8.0 || test.ph > 8.4) {
      issues.push(`pH ${test.ph} is outside optimal range (8.0-8.4)`);
    } else {
      good.push(`pH ${test.ph} is good`);
    }
    
    if (test.ammonia > 0) {
      issues.push(`Ammonia ${test.ammonia} detected - should be 0`);
    } else {
      good.push(`Ammonia levels are safe`);
    }
    
    if (test.nitrite > 0) {
      issues.push(`Nitrite ${test.nitrite} detected - should be 0`);
    } else {
      good.push(`Nitrite levels are safe`);
    }
    
    if (test.nitrate > 20) {
      issues.push(`Nitrate ${test.nitrate} is high - consider water change`);
    } else if (test.nitrate <= 10) {
      good.push(`Nitrate levels are excellent`);
    }

    return { issues, good };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSendToChat = (test: WaterParameters) => {
    const analysis = analyzeTest(test);
    onSendToChat(test);
    
    toast({
      title: "Test sent to chat",
      description: "Water test analysis has been sent to the chat for detailed discussion.",
    });
  };

  if (tests.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="text-4xl">📊</div>
          <div>
            <h4 className="font-medium">No water tests logged</h4>
            <p className="text-sm text-muted-foreground">Start tracking your water parameters</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Water Test Results ({tests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tests.map((test) => {
            const analysis = analyzeTest(test);
            const hasIssues = analysis.issues.length > 0;
            
            return (
              <Card key={test.id} className={`transition-all duration-200 hover:shadow-md ${
                hasIssues ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold">
                          {formatDate(test.date)}
                        </h3>
                        {hasIssues && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Issues Detected</span>
                          </div>
                        )}
                        {getStatusBadge(hasIssues ? 'danger' : 'good')}
                      </div>
                      
                      {/* Parameter Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">pH:</span>
                          <span className="font-medium ml-1">{test.ph}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Salinity:</span>
                          <span className="font-medium ml-1">{test.salinity}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Temp:</span>
                          <span className="font-medium ml-1">{test.temperature}°F</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Ammonia:</span>
                          <span className="font-medium ml-1">{test.ammonia}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Nitrite:</span>
                          <span className="font-medium ml-1">{test.nitrite}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Nitrate:</span>
                          <span className="font-medium ml-1">{test.nitrate}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">KH:</span>
                          <span className="font-medium ml-1">{test.kh}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Calcium:</span>
                          <span className="font-medium ml-1">{test.calcium}</span>
                        </div>
                      </div>

                      {/* Issues and Good Parameters */}
                      {analysis.issues.length > 0 && (
                        <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                          <span className="font-medium text-red-800 dark:text-red-200">Issues: </span>
                          <span className="text-red-700 dark:text-red-300">
                            {analysis.issues.join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {analysis.good.length > 0 && (
                        <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                          <span className="font-medium text-green-800 dark:text-green-200">Good: </span>
                          <span className="text-green-700 dark:text-green-300">
                            {analysis.good.join(', ')}
                          </span>
                        </div>
                      )}

                      {test.aiInsights && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                          <span className="font-medium text-blue-800 dark:text-blue-200">AI Insights: </span>
                          <span className="text-blue-700 dark:text-blue-300">{test.aiInsights}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendToChat(test)}
                        className="hidden sm:flex gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Analyze
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleSendToChat(test)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send to Chat
                          </DropdownMenuItem>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Test
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Test Result</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this water test result? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => onDeleteTest(test.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterTestResultsTable;
