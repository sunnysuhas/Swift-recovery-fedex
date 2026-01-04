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
import { batchWriteCases, batchWriteDcas } from '@/firebase/firestore/batch-writes';
import { useFirestore, useUser } from '@/firebase';
import { Upload, FileCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ImportDataPage() {
  const firestore = useFirestore();
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, header, index) => {
          // @ts-ignore
          obj[header] = values[index];
          return obj;
        }, {});
      });
      setPreviewData(data);
    };
    reader.readAsText(fileToParse);
  };
  
  const handleUpload = async () => {
    if (!file || !firestore || !user) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (fileType === 'cases') {
        await batchWriteCases(firestore, previewData);
      } else {
        await batchWriteDcas(firestore, previewData);
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
                <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="w-full"/>
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
