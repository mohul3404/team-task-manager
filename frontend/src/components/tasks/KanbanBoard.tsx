import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus, ProjectMember } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import { useUpdateTask } from '../../hooks/useTasks';
import { STATUS_CONFIG } from '../../lib/utils';

interface Props {
  tasks: Task[];
  projectId: string;
  members: ProjectMember[];
}

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export function KanbanBoard({ tasks, projectId, members }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createIn, setCreateIn] = useState<TaskStatus | null>(null);
  const updateTask = useUpdateTask();

  const tasksByStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task || task.status === newStatus) return;

    updateTask.mutate({ taskId: draggableId, projectId, status: newStatus });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const columnTasks = tasksByStatus[status];
            return (
              <div key={status} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.bg} border-2 ${cfg.border}`} />
                    <h3 className="text-sm font-semibold text-gray-700">{cfg.label}</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setCreateIn(status)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-24 p-1 rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {columnTasks.map((task, idx) => (
                        <Draggable key={task.id} draggableId={task.id} index={idx}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                dragging={snap.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <button
                          onClick={() => setCreateIn(status)}
                          className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                        >
                          + Add task
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {createIn && (
        <CreateTaskModal
          projectId={projectId}
          members={members}
          defaultStatus={createIn}
          onClose={() => setCreateIn(null)}
        />
      )}
    </>
  );
}
