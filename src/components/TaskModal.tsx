import { useState, useEffect } from "react";
import type { TaskDocType, ChecklistItemDocType } from "../db/schemas";
import {
  createTask,
  getChecklistItemsForTask,
  updateTask,
  updateChecklistItemStatus,
  addChecklistItem,
  deleteChecklistItem,
} from "../db";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  task?: TaskDocType | null;
}

type TaskStatus = TaskDocType["status"];
type ChecklistStatus = ChecklistItemDocType["status"];

const statusConfig = {
  not_started: {
    label: "Not started",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    dotColor: "#9CA3AF",
    icon: "○",
  },
  in_progress: {
    label: "In progress",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    dotColor: "#EA580C",
    icon: "◐",
  },
  blocked: {
    label: "Blocked",
    color: "text-red-600",
    bgColor: "bg-red-50",
    dotColor: "#DC2626",
    icon: "⚠",
  },
  final_check: {
    label: "Final installation done",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    dotColor: "#2563EB",
    icon: "◑",
  },
  done: {
    label: "Done",
    color: "text-green-600",
    bgColor: "bg-green-50",
    dotColor: "#16A34A",
    icon: "✓",
  },
};

export default function TaskModal({
  isOpen,
  onClose,
  x,
  y,
  task,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>("not_started");
  const [items, setItems] = useState<ChecklistItemDocType[]>([]);
  const [newItem, setNewItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setStatus(task.status);
      loadItems(task.id);
    } else if (isOpen && !task) {
      setTitle("");
      setStatus("not_started");
      setItems([]);
      setPendingItems([]);
    }
  }, [isOpen, task]);

  const loadItems = async (taskId: string) => {
    try {
      const data = await getChecklistItemsForTask(taskId);
      setItems(data.map((item) => item.toJSON() as ChecklistItemDocType));
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      if (task) {
        await updateTask(task.id, { title, status });
      } else {
        const newTask = await createTask(x, y, title);
        const taskId = newTask.get("id") as string;

        for (let i = 0; i < pendingItems.length; i++) {
          await addChecklistItem(taskId, pendingItems[i]);
        }
      }
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeStatus = async (itemId: string, newStatus: ChecklistStatus) => {
    try {
      await updateChecklistItemStatus(itemId, newStatus);
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    if (task) {
      try {
        await addChecklistItem(task.id, newItem);
        setNewItem("");
        await loadItems(task.id);
      } catch (error) {
        console.error("Failed to add:", error);
      }
    } else {
      setPendingItems((prev) => [...prev, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await deleteChecklistItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const removePending = (index: number) => {
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[466px] h-[543px] flex flex-col border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Task Name</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          {task && (
            <div className="flex items-center gap-2 mt-3">
              <div className={`w-3 h-3 rounded-full ${
                task.status === 'blocked' ? 'bg-red-500' :
                task.status === 'done' ? 'bg-green-500' :
                task.status === 'in_progress' ? 'bg-orange-500' :
                task.status === 'final_check' ? 'bg-blue-500' : 'bg-gray-400'
              }`}></div>
              <span className={statusConfig[task.status].color}>
                {task.status === "blocked"
                  ? "Ticket progress is blocked"
                  : statusConfig[task.status].label}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  X Coordinate
                </label>
                <input
                  type="number"
                  value={x}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Y Coordinate
                </label>
                <input
                  type="number"
                  value={y}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {task && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <option key={status} value={status}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Checklist</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 font-medium">
                    {items.length + pendingItems.length} STEPS
                  </span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    title="Expand checklist"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M8 4l4 4-4 4V4z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1 relative">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          changeStatus(item.id, e.target.value as ChecklistStatus)
                        }
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer appearance-none opacity-0 absolute inset-0 z-10"
                        title={`Change status from ${
                          statusConfig[item.status].label
                        }`}
                      >
                        {Object.entries(statusConfig).map(
                          ([status, config]) => (
                            <option key={status} value={status}>
                              {config.label}
                            </option>
                          )
                        )}
                      </select>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center pointer-events-none text-white font-bold ${
                        item.status === 'blocked' ? 'bg-red-500' :
                        item.status === 'done' ? 'bg-green-500' :
                        item.status === 'in_progress' ? 'bg-orange-500' :
                        item.status === 'final_check' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        {statusConfig[item.status].icon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-1">
                        {item.title}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          statusConfig[item.status].color
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'blocked' ? 'bg-red-500' :
                          item.status === 'done' ? 'bg-green-500' :
                          item.status === 'in_progress' ? 'bg-orange-500' :
                          item.status === 'final_check' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        {statusConfig[item.status].label}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 text-sm p-1 rounded"
                      title="Delete item"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.056A2 2 0 0 0 5.046 16h5.908a2 2 0 0 0 1.993-1.792l.557-10.056a.58.58 0 0 0-.01-1.152H11Z" />
                      </svg>
                    </button>
                  </div>
                ))}

                {!task &&
                  pendingItems.map((itemTitle, index) => (
                    <div
                      key={`pending-${index}`}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">
                          {itemTitle}
                        </div>
                        <div className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          Not started
                        </div>
                      </div>

                      <button
                        onClick={() => removePending(index)}
                        className="text-gray-400 hover:text-red-500 text-sm p-1 rounded"
                        title="Delete item"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 1.152l.557 10.056A2 2 0 0 0 5.046 16h5.908a2 2 0 0 0 1.993-1.792l.557-10.056a.58.58 0 0 0-.01-1.152H11Z" />
                        </svg>
                      </button>
                    </div>
                  ))}

                <div
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => document.getElementById("new-item-input")?.focus()}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="white"
                      >
                        <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1">
                    <input
                      id="new-item-input"
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="ADD NEW ITEM"
                      className="w-full bg-transparent border-none outline-none text-blue-500 font-medium placeholder-blue-400 focus:ring-0"
                      onKeyPress={(e) => e.key === "Enter" && addItem()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-300 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : task ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
