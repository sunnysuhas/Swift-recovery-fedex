
import AppHeader from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function SettingsPage() {
    const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-1');

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Settings" />
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your account and profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userAvatar?.imageUrl} data-ai-hint={userAvatar?.imageHint} />
                <AvatarFallback>FA</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <h3 className="text-lg font-semibold">Finance Admin</h3>
                <p className="text-sm text-muted-foreground">admin@fedex.com</p>
              </div>
               <Button variant="outline" className="ml-auto">Change Avatar</Button>
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Finance Admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@fedex.com" disabled />
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
            <Button>Save Changes</Button>
        </div>
      </div>
    </main>
  );
}
