'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/components/providers/local-auth-provider';
// import { useToast } from '@/hooks/use-toast'; // Already there
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SettingsPage() {
  const { user, login } = useUser();
  // const { auth, firestore } = useFirebase(); // Removed
  // const storage = getStorage(); // Removed
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
      // Mock Upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      const downloadURL = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`; // Mock URL

      setPhotoURL(downloadURL); // Optimistically update UI

      // Update local auth provider state (if we had a method for it, or just rely on state update)
      // For now, we just mock the persistence

      toast({
        title: 'Avatar Updated!',
        description: 'Your new avatar has been saved (Mock).',
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
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to save changes.',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Mock Update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Here we would call updateUser server action
      // await updateUser(user.uid, { displayName });

      // Update local session to reflect name change
      if (user.email) {
        login(user.email, user.role); // Re-login to refresh details is hacky but works for mock
      }

      toast({
        title: 'Success!',
        description: 'Your profile has been updated (Mock).',
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
                  disabled={isSaving}
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