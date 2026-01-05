import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/components/providers/local-auth-provider';
import { updateCase } from '@/actions/cases';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { CaseStatus } from '@/lib/types';

type UpdateStatusActionProps = {
  caseId: string;
  currentStatus: CaseStatus;
};

const availableStatuses: CaseStatus[] = [
  'New',
  'Assigned',
  'Contact Made',
  'Payment Negotiated',
  'In Dispute',
  'Resolved',
  'Closed - Unresolved',
];

export function UpdateStatusAction({ caseId, currentStatus }: UpdateStatusActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>(currentStatus);
  const { user } = useUser();
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!user || selectedStatus === currentStatus) {
      setIsOpen(false);
      // If not logged in we shouldn't even see the button ideally, but for safety:
      if (!user) {
        toast({ title: 'Error', description: 'Must be logged in.', variant: 'destructive' });
      }
      return;
    }
    setIsSaving(true);
    try {
      await updateCase(caseId, { status: selectedStatus });
      toast({
        title: 'Status Updated',
        description: `Case ${caseId} status changed to ${selectedStatus}.`,
      });
      setIsOpen(false);
      // In a real app we might revalidate path or router.refresh() here.
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the case status. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Case Status</DialogTitle>
          <DialogDescription>
            Select a new status for case {caseId}. This action will be logged.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status-select" className="text-right">
              Status
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as CaseStatus)}
            >
              <SelectTrigger id="status-select" className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isSaving || selectedStatus === currentStatus}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
