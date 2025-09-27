import {
  createRxDatabase,
  type RxCollection,
  type RxDatabase,
  addRxPlugin,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import {
  userSchema,
  type UserDocType,
  taskSchema,
  type TaskDocType,
  checklistItemSchema,
  type ChecklistItemDocType,
} from "./schemas";
import { useUserStore } from "../store/userStore";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

export type Collections = {
  users: RxCollection<UserDocType>;
  tasks: RxCollection<TaskDocType>;
  checklistItems: RxCollection<ChecklistItemDocType>;
};

export type AppDatabase = RxDatabase<Collections>;

let dbPromise: Promise<AppDatabase> | null = null;

export async function getDB(): Promise<AppDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      addRxPlugin(RxDBDevModePlugin);

      const db = await createRxDatabase<Collections>({
        name: "cendas-local",
        storage: wrappedValidateAjvStorage({ storage: getRxStorageDexie() }),
        multiInstance: false,
        ignoreDuplicate: true,
      });

      await db.addCollections({
        users: { schema: userSchema },
        tasks: { schema: taskSchema },
        checklistItems: { schema: checklistItemSchema },
      });

      return db;
    })();
  }
  return dbPromise;
}

export async function findOrCreateUser(name: string) {
  const db = await getDB();
  const id = name.trim().toLowerCase();
  let doc = await db.users.findOne(id).exec();
  if (doc) return doc;
  const byName = await db.users.findOne({ selector: { name } }).exec();
  if (byName) return byName;
  return db.users.insert({ id, name, createdAt: Date.now() });
}

export function getCurrentUserId() {
  return useUserStore.getState().getCurrentUserId();
}

export function setCurrentUser(userId: string | null) {
  useUserStore.getState().setCurrentUserId(userId);
}

export async function getCurrentUserDoc() {
  const userId = getCurrentUserId();
  if (!userId) return null;
  const db = await getDB();
  return db.users.findOne(userId).exec();
}

export function signOut() {
  setCurrentUser(null);
}

export async function createTask(x: number, y: number, title: string) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  
  const db = await getDB();
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const task = await db.tasks.insert({
    id: taskId,
    userId,
    x,
    y,
    title,
    status: 'not_started',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return task;
}

export async function getTasksForUser() {
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  const db = await getDB();
  return db.tasks.find({ selector: { userId } }).exec();
}

export async function getChecklistItemsForTask(taskId: string) {
  const userId = getCurrentUserId();
  if (!userId) return [];
  
  const db = await getDB();
  return db.checklistItems.find({ 
    selector: { taskId, userId },
    sort: [{ order: 'asc' }]
  }).exec();
}

export async function updateTaskStatus(taskId: string, status: TaskDocType['status']) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  
  const db = await getDB();
  const task = await db.tasks.findOne({ selector: { id: taskId, userId } }).exec();
  if (!task) throw new Error('Task not found');
  
  await task.incrementalModify((data) => ({
    ...data,
    status,
    updatedAt: Date.now(),
  }));
}

export async function updateTask(taskId: string, updates: Partial<Pick<TaskDocType, 'title' | 'status'>>) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  
  const db = await getDB();
  const task = await db.tasks.findOne({ selector: { id: taskId, userId } }).exec();
  if (!task) throw new Error('Task not found');
  
  await task.incrementalModify((data) => ({
    ...data,
    ...updates,
    updatedAt: Date.now(),
  }));
}

export async function updateChecklistItemStatus(itemId: string, status: ChecklistItemDocType['status']) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  
  const db = await getDB();
  const item = await db.checklistItems.findOne({ selector: { id: itemId, userId } }).exec();
  if (!item) throw new Error('Checklist item not found');
  
  await item.incrementalModify((data) => ({
    ...data,
    status,
    updatedAt: Date.now(),
  }));
}

export async function addChecklistItem(taskId: string, title: string) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  
  const db = await getDB();
  const existingItems = await getChecklistItemsForTask(taskId);
  const maxOrder = existingItems.reduce((max, item) => Math.max(max, item.get('order') as number), -1);
  
  return db.checklistItems.insert({
    id: `item_${taskId}_${Date.now()}`,
    taskId,
    userId,
    title,
    status: 'not_started',
    order: maxOrder + 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function updateChecklistItem(itemId: string, title: string) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  
  const db = await getDB();
  const item = await db.checklistItems.findOne({ selector: { id: itemId, userId } }).exec();
  if (!item) throw new Error('Checklist item not found');
  
  await item.incrementalModify((data) => ({
    ...data,
    title,
    updatedAt: Date.now(),
  }));
}

export async function deleteChecklistItem(itemId: string) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  
  const db = await getDB();
  const item = await db.checklistItems.findOne({ selector: { id: itemId, userId } }).exec();
  if (!item) throw new Error('Checklist item not found');
  
  await item.remove();
}
