'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirebase } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();
  const storage = getStorage();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-1');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPhotoURL(user.photoURL || userAvatar?.imageUrl || '');
    }
  }, [user, userAvatar]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const avatarRef = storageRef(storage, `avatars/${user.uid}/${file.name}`);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setPhotoURL(downloadURL); // Optimistically update UI

      // Now update auth and firestore
      await updateProfile(user, { photoURL: downloadURL });
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { photoURL: downloadURL }, { merge: true });

      toast({
        title: 'Avatar Updated!',
        description: 'Your new avatar has been saved.',
      });

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not upload your new avatar.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !auth.currentUser || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to save changes.',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName });

      // Update Firestore user document
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { displayName }, { merge: true });

      toast({
        title: 'Success!',
        description: 'Your profile has been updated.',
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not save your profile changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your account and profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 relative group">
                <AvatarImage src={photoURL} data-ai-hint={userAvatar?.imageHint} />
                <AvatarFallback>
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </Avatar>
              <div className="grid gap-1">
                <h3 className="text-lg font-semibold">{displayName || 'Anonymous User'}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <Button variant="outline" className="ml-auto" onClick={handleAvatarClick} disabled={isUploading}>
                Change Avatar
              </Button>
              <Input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif" 
                disabled={isUploading}
              />
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isUserLoading || isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue="Global Collections Manager" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Choose how you want to be notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive summaries and alerts via email.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">SLA Breach Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications for SLA breaches.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h4 className="font-medium">High-Priority Case Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Notifications for new high-priority cases.
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </main>
  );
}