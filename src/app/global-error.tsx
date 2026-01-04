'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerCrash } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <ServerCrash className="h-16 w-16 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Something went wrong</CardTitle>
                    <CardDescription>
                        The server is busy, please try again later.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => reset()}>Try again</Button>
                </CardContent>
            </Card>
        </div>
      </body>
    </html>
  );
}
