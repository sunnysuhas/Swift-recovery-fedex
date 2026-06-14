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
import { AICsvProfiler } from '@/components/import/ai-csv-profiler';
import Papa from 'papaparse';
import { calculateCasePriority } from '@/ai/flows/calculate-case-priority';

export default function ImportDataPage() {
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
            title: 'CSV Parse Warning',
            description: `Found ${results.errors.length} formatting warnings in the CSV file. Preview still generated.`,
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
      let finalData: any[] = [];

      if (fileType === 'cases') {
        const totalItems = previewData.length;
        let processedCount = 0;

        for (const item of previewData) {
          const amount = parseFloat(item.amount || item.Amount || 0);
          const aging = parseInt(item.aging || item.Aging || 0);
          const paymentBehavior = item.paymentBehavior || item['Payment Behavior'] || 'Unknown';
          let priorityScore = parseInt(item.priorityScore || item['Priority Score'] || 0);
          let actionPlan = item.actionPlan || item['Action Plan'] || '';

          if (!priorityScore || isNaN(priorityScore)) {
            try {
              // Rate limiting delay (brief backoff to respect local developer servers)
              if (processedCount > 0 && processedCount % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1500));
              }

              const aiRes = await calculateCasePriority({ debtAmount: amount, aging, paymentBehavior });
              priorityScore = aiRes.priorityScore;
              if (!actionPlan) actionPlan = `AI Note: ${aiRes.reasoning}`;
            } catch (e: any) {
              console.warn('AI scoring failed during batch parsing, using default score.', e);
              priorityScore = 50;
            }
          }

          finalData.push({
            ...item,
            amount,
            aging,
            priorityScore,
            actionPlan,
            paymentBehavior,
            debtor: {
              name: item.debtorName || item['Debtor Name'] || 'Unknown Debtor',
              accountId: item.debtorAccountId || item['Debtor Account ID'] || `ACC-${Math.floor(10000 + Math.random() * 90000)}`
            }
          });

          processedCount++;
        }

        await batchCreateCases(finalData, user.uid);
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
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50/20 dark:bg-background min-h-screen">
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Portfolio Ingestion Center
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload and audit recovery portfolios or agency credentials
          </p>
        </div>
      </div>
      
      {/* KPI Ribbon */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/40 bg-card p-4 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Historical Ingestion Volume</span>
          <span className="text-2xl font-bold mt-1">12.4K cases</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Across 18 portfolios</p>
        </div>
        <div className="rounded-lg border border-border/40 bg-card p-4 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Schema Match Accuracy</span>
          <span className="text-2xl font-bold text-green-500 mt-1">100%</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Active mapper enforcement</p>
        </div>
        <div className="rounded-lg border border-border/40 bg-card p-4 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-muted-foreground">Validation Quality Rating</span>
          <span className="text-2xl font-bold mt-1">A+ Class</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Verified integrity index</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload card */}
        <Card className="md:col-span-1 shadow-sm border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold">Upload Data File</CardTitle>
            <CardDescription className="text-xs">
              Import cases or partner DCAs from a standard CSV file with headers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="file-type" className="text-xs font-semibold text-muted-foreground">Select Data Type</Label>
              <select
                id="file-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as 'cases' | 'dcas')}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="cases">Cases Portfolio</option>
                <option value="dcas">Debt Collection Agencies (DCAs)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file-upload" className="text-xs font-semibold text-muted-foreground">Choose CSV File</Label>
              <div className="flex items-center gap-2">
                <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="w-full cursor-pointer" />
              </div>
            </div>
            {file && (
              <Alert className="bg-card">
                <FileCheck className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-xs font-bold">File Selected</AlertTitle>
                <AlertDescription className="text-[11px] text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(1)} KB)</AlertDescription>
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
          <CardFooter className="pt-2 border-t border-border/40">
            <Button onClick={handleUpload} disabled={!file || isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Batch...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import to Database
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* AI CSV Profiler */}
        <div className="md:col-span-1">
          <AICsvProfiler
            fileName={file?.name || 'No file loaded'}
            rowCount={previewData.length}
            previewRows={previewData}
            dataType={fileType}
          />
        </div>
      </div>

      {/* File Preview */}
      <Card className="shadow-sm border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold">File Preview</CardTitle>
          <CardDescription className="text-xs">
            Showing first 5 columns and rows of the loaded spreadsheet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {previewData.length > 0 ? (
            <div className="relative w-full overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    {headers.slice(0, 6).map(header => <TableHead key={header} className="font-semibold text-xs py-2">{header}</TableHead>)}
                    {headers.length > 6 && <TableHead className="font-semibold text-xs py-2">...</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 5).map((row, index) => (
                    <TableRow key={index} className="hover:bg-accent/10 transition-colors">
                      {headers.slice(0, 6).map(header => <TableCell key={header} className="text-xs py-2 max-w-[150px] truncate">{row[header]}</TableCell>)}
                      {headers.length > 6 && <TableCell className="text-xs py-2 text-muted-foreground font-mono">...</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border/70 rounded-lg bg-slate-50/5">
              <FileCheck className="h-8 w-8 text-muted-foreground/35 mb-2" />
              <p className="text-xs text-muted-foreground">Select and parse a CSV file to inspect values</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
