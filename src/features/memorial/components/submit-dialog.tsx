'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryNumber?: number;
}

export default function SubmitDialog({ open, onOpenChange, entryNumber }: SubmitDialogProps) {
  const [humanity, setHumanity] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = humanity.length >= 10 && humanity.length <= 280 && relationship && region && email;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/memorial/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryNumber: entryNumber || null,
          humanity,
          relationship,
          age: age ? parseInt(age, 10) : null,
          region,
          contactEmail: email,
          photoUrl: photoUrl || null
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }

      toast.success('Thank you. Your submission is under review.');
      onOpenChange(false);
      setHumanity('');
      setRelationship('');
      setAge('');
      setRegion('');
      setEmail('');
      setPhotoUrl('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-zinc-950 border-zinc-800 text-white max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-white'>
            Remember someone{entryNumber ? ` (#${entryNumber.toLocaleString()})` : ''}
          </DialogTitle>
          <DialogDescription className='text-zinc-400'>
            Tell us who they were. Submissions are reviewed before appearing.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Who were they */}
          <div>
            <label className='text-sm text-zinc-400 mb-1 block'>
              Who were they? <span className='text-red-500'>*</span>
            </label>
            <Textarea
              value={humanity}
              onChange={(e) => setHumanity(e.target.value)}
              placeholder='A mother of three who sang while she cooked'
              maxLength={280}
              className='bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 min-h-20'
            />
            <span className='text-xs text-zinc-600 mt-1 block'>{humanity.length}/280</span>
          </div>

          {/* Relationship */}
          <div>
            <label className='text-sm text-zinc-400 mb-1 block'>
              Your relationship <span className='text-red-500'>*</span>
            </label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger className='w-full bg-zinc-900 border-zinc-700 text-white'>
                <SelectValue placeholder='Select...' />
              </SelectTrigger>
              <SelectContent className='bg-zinc-900 border-zinc-700'>
                <SelectItem value='family'>Family member</SelectItem>
                <SelectItem value='friend'>Friend</SelectItem>
                <SelectItem value='neighbor'>Neighbor</SelectItem>
                <SelectItem value='colleague'>Colleague</SelectItem>
                <SelectItem value='community'>Community member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age + Region row */}
          <div className='flex gap-3'>
            <div className='w-24'>
              <label className='text-sm text-zinc-400 mb-1 block'>Age</label>
              <Input
                type='number'
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={0}
                max={120}
                placeholder='—'
                className='bg-zinc-900 border-zinc-700 text-white'
              />
            </div>
            <div className='flex-1'>
              <label className='text-sm text-zinc-400 mb-1 block'>
                Region <span className='text-red-500'>*</span>
              </label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className='w-full bg-zinc-900 border-zinc-700 text-white'>
                  <SelectValue placeholder='Select...' />
                </SelectTrigger>
                <SelectContent className='bg-zinc-900 border-zinc-700'>
                  <SelectItem value='Gaza'>Gaza</SelectItem>
                  <SelectItem value='West Bank'>West Bank</SelectItem>
                  <SelectItem value='Lebanon'>Lebanon</SelectItem>
                  <SelectItem value='Israel'>Israel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className='text-sm text-zinc-400 mb-1 block'>
              Your email <span className='text-red-500'>*</span>
            </label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='For follow-up only, never displayed'
              className='bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600'
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className='text-sm text-zinc-400 mb-1 block'>Photo link</label>
            <Input
              type='url'
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder='https://...'
              className='bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600'
            />
            <span className='text-xs text-zinc-600 mt-1 block'>Optional — link to a hosted photo</span>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className='w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40'
          >
            {submitting ? 'Submitting...' : 'Submit memory'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
