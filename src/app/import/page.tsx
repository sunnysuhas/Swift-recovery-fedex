'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, FileCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { batchCreateCases } from '@/actions/cases';
import { batchCreateDcas } from '@/actions/dcas';
import { useUser } from '@/components/providers/local-auth-provider';
import Papa from 'papaparse';
import { calculateCasePriority } from '@/ai/flows/calculate-case-priority';

export default function ImportDataPage() {
  // const firestore = useFirestore(); // Removed
  const { user } = useUser();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'cases' | 'dcas'>('cases');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = (fileToParse: File) => {
    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error(results.errors);
          toast({
            variant: 'destructive',
            title: 'CSV Parse Error',
            description: `Found ${results.errors.length} errors in the CSV file. Check console for details.`,
          });
        }
        setPreviewData(results.data);
      },
      error: (error: Error) => {
        console.error(error);
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleUpload = async () => {
    if (!file || !user) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Pre-process for AI Priority if needed (for Cases)
      let finalData = previewData;

      if (fileType === 'cases') {
        // We can do this on client or server. Server is better for API limiting/secrets, 
        // but `calculateCasePriority` is accessible.
        // Let's try to map it.
        // Actually, let's just pass raw data to server action and let it handle? 
        // But `batchCreateCases` is simple insert. 
        // Let's do the AI scoring here iteratively or assume we skip it for now to ensure migration works first?
        // The prompt said "integrate AI". I should match previous logic.
        // Previous logic in `batch-writes.ts` called `calculateCasePriority`.
        // I will iterate here.

        finalData = await Promise.all(previewData.map(async (item) => {
          // Simple parser from `batch-writes` logic (replicated simplified)
          const amount = parseFloat(item.amount || item.Amount || 0);
          const aging = parseInt(item.aging || item.Aging || 0);
          const paymentBehavior = item.paymentBehavior || item['Payment Behavior'] || 'Unknown';
          let priorityScore = parseInt(item.priorityScore || item['Priority Score'] || 0);
          let actionPlan = item.actionPlan || item['Action Plan'] || '';

          if (!priorityScore || isNaN(priorityScore)) {
            try {
              const aiRes = await calculateCasePriority({ debtAmount: amount, aging, paymentBehavior });
              priorityScore = aiRes.priorityScore;
              if (!actionPlan) actionPlan = `AI Note: ${aiRes.reasoning}`;
            } catch (e) {
              console.warn('AI failed', e);
              priorityScore = 50;
            }
          }
          return {
            ...item,
            amount, aging, priorityScore, actionPlan, paymentBehavior,
            debtor: { name: item.debtorName || item['Debtor Name'], accountId: item.debtorAccountId || item['Debtor Account ID'] }
            // we need to be careful with mapping to what `createCase` expects
          };
        }));

        await batchCreateCases(finalData);
      } else {
        await batchCreateDcas(previewData);
      }

      toast({
        title: 'Upload Successful',
        description: `${previewData.length} records have been imported successfully.`,
      });
      setFile(null);
      setPreviewData([]);

    } catch (e: any) {
      console.error(e);
      setError(`Upload failed: ${e.message}`);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was an error processing your file.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Import Data</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upload Data File</CardTitle>
            <CardDescription>
              Import case or DCA data from a CSV file. The file should contain a header row.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-type">Select Data Type</Label>
              <select
                id="file-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as 'cases' | 'dcas')}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="cases">Cases</option>
                <option value="dcas">DCAs</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">Choose CSV File</Label>
              <div className="flex items-center gap-2">
                <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="w-full" />
              </div>
            </div>
            {file && (
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertTitle>File Selected</AlertTitle>
                <AlertDescription>{file.name}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleUpload} disabled={!file || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Import
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>File Preview</CardTitle>
            <CardDescription>
              A preview of the first 5 rows from your selected file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      {headers.map(header => <TableCell key={header}>{row[header]}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Select a file to see a preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
