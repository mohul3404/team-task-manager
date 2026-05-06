import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Modal } from '../ui/Modal';
import { CreateProjectForm } from '../projects/CreateProjectForm';

export function AppLayout() {
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onNewProject={() => setShowNewProject(true)} />

      <main className="flex-1 ml-64 overflow-auto">
        <Outlet />
      </main>

      <Modal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        title="New Project"
        size="md"
      >
        <CreateProjectForm onSuccess={() => setShowNewProject(false)} />
      </Modal>
    </div>
  );
}
