'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ADMIN_EMAILS = ['reddykesava60@gmail.com', 'sunnysuhas108@gmail.com'];

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firestore) {
        setError("Firestore is not initialized. Please try again later.");
        return;
    }
    setIsLoading(true);
    setError(null);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const displayName = `${firstName} ${lastName}`;

        // Update profile in Firebase Auth
        await updateProfile(user, { displayName });

        const isDcaAgent = email.includes('dca');
        const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
        const userRole = isAdmin ? 'Admin' : (isDcaAgent ? 'DCA_Agent' : 'Admin'); // Default to Admin
        const dcaId = isDcaAgent ? 'dca-2' : null;

        const batch = writeBatch(firestore);

        const userDocRef = doc(firestore, "users", user.uid);
        batch.set(userDocRef, {
            id: user.uid,
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            role: userRole,
            dcaId: dcaId,
            photoURL: user.photoURL
        });

        if (userRole === 'Admin') {
            const adminRoleRef = doc(firestore, "roles_admin", user.uid);
            batch.set(adminRoleRef, { role: 'Admin', createdAt: new Date() });
        }

        await batch.commit();

        toast({
            title: "Signup Successful",
            description: "Your account has been created.",
        });
        router.push("/");

    } catch (result: any) {
        const errorMessage = result.message || 'An unknown error occurred.';
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Signup Failed",
            description: errorMessage,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Logo className="h-8 w-8" />
                <CardTitle className="text-2xl">RecoveryAI</CardTitle>
            </div>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input 
                    id="first-name" 
                    placeholder="Max" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input 
                    id="last-name" 
                    placeholder="Robinson" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Signup Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create an account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
