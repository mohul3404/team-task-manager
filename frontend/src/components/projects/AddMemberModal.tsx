import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useAddMember } from '../../hooks/useProjects';

interface Props {
  projectId: string;
  onClose: () => void;
}

export function AddMemberModal({ projectId, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const addMember = useAddMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await addMember.mutateAsync({ projectId, email, role });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Add Member" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <input
            type="email"
            className="input"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
          <p className="text-xs text-gray-500 mt-1">They must already have a TaskFlow account.</p>
        </div>
        <div>
          <label className="label">Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="MEMBER">Member — can view and manage tasks</option>
            <option value="ADMIN">Admin — can manage project & members</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!email.trim() || addMember.isPending}>
            {addMember.isPending ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
