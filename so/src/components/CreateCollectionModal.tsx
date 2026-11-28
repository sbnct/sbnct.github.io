import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Collection, CollectionPrivacy } from '../types';
import { createCollection } from '../lib/collections';
import { CustomDropdown, DropdownOption } from './CustomDropdown';
import { LimitedUsersPicker } from './LimitedUsersPicker';
import { ModalPortal } from './ModalPortal';

interface CreateCollectionModalProps {
  isOpen: boolean;
  currentUserId: string;
  onClose: () => void;
  onCreated: (collection: Collection) => void;
}

const PRIVACY_OPTIONS: DropdownOption[] = [
  { value: 'public', label: 'Public (Visible on Profile & Photo Pages)' },
  { value: 'followers', label: 'Followers (Only followers)' },
  { value: 'limited', label: 'Limited (Only chosen users)' },
  { value: 'unlisted', label: 'By Link (Only viewable with copied link)' },
  { value: 'private', label: 'Private (Gallery only)' },
];

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  currentUserId,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<CollectionPrivacy>('public');
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const close = () => {
    if (submitting) return;
    setName('');
    setPrivacy('public');
    setAllowedUserIds([]);
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a collection name.');
      return;
    }

    setSubmitting(true);
    try {
      const collection = await createCollection(
        currentUserId,
        trimmedName,
        privacy,
        allowedUserIds
      );
      onCreated(collection);
      setName('');
      setPrivacy('public');
      setAllowedUserIds([]);
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Create collection"
        onClick={close}
      >
        <form
          onSubmit={handleSubmit}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-black/[0.08] rounded-3xl p-6 space-y-5 shadow-2xl animate-modal-pop"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#0A0A0A]">
                New Collection
              </h2>
              <p className="text-xs text-[#737373] mt-1">
                Choose a name and who can view the collection.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              aria-label="Close collection creation"
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-black/[0.08] text-[#0A0A0A] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0A0A0A] mb-1.5">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Kyoto Autumn 2026"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent focus:bg-white focus:border-[#0A0A0A] outline-none text-base md:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0A0A0A] mb-1.5">
              Privacy
            </label>
            <CustomDropdown
              value={privacy}
              options={PRIVACY_OPTIONS}
              onChange={(value) => setPrivacy(value as CollectionPrivacy)}
              ariaLabel="Collection privacy"
              className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-transparent text-base md:text-sm"
            />
          </div>

          {privacy === 'limited' && (
            <LimitedUsersPicker
              currentUserId={currentUserId}
              selectedUserIds={allowedUserIds}
              onChange={setAllowedUserIds}
            />
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              className="min-h-[42px] px-4 py-2 rounded-xl text-xs font-medium text-[#525252] hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0A0A0A] text-white text-xs font-medium hover:bg-black/85 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
};
