import type { RxJsonSchema } from 'rxdb'

export type UserDocType = {
  id: string
  name: string
  createdAt: number
}

export const userSchema: RxJsonSchema<UserDocType> = {
  title: 'user schema',
  description: 'Stores users by unique name',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 255 },
    name: { type: 'string', maxLength: 255 },
    createdAt: { type: 'number' },
  },
  required: ['id', 'name', 'createdAt'],
  indexes: ['name'],
}


export type TaskDocType = {
  id: string
  userId: string
  x: number
  y: number
  title: string
  status: 'not_started' | 'in_progress' | 'blocked' | 'final_check' | 'done'
  createdAt: number
  updatedAt: number
}

export const taskSchema: RxJsonSchema<TaskDocType> = {
  title: 'task schema',
  description: 'Tasks with coordinates and status',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 255 },
    userId: { type: 'string', maxLength: 255 },
    x: { type: 'number', multipleOf: 0.01 },
    y: { type: 'number', multipleOf: 0.01 },
    title: { type: 'string', maxLength: 500 },
    status: { 
      type: 'string', 
      enum: ['not_started', 'in_progress', 'blocked', 'final_check', 'done'],
      maxLength: 50
    },
    createdAt: { type: 'number', multipleOf: 1, minimum: 0 },
    updatedAt: { type: 'number', multipleOf: 1, minimum: 0 },
  },
  required: ['id', 'userId', 'x', 'y', 'title', 'status', 'createdAt', 'updatedAt'],
  indexes: ['userId', 'status'],
}

export type ChecklistItemDocType = {
  id: string
  taskId: string
  userId: string
  title: string
  description?: string
  status: 'not_started' | 'in_progress' | 'blocked' | 'final_check' | 'done'
  order: number
  createdAt: number
  updatedAt: number
}

export const checklistItemSchema: RxJsonSchema<ChecklistItemDocType> = {
  title: 'checklist item schema',
  description: 'Checklist items for tasks',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 255 },
    taskId: { type: 'string', maxLength: 255 },
    userId: { type: 'string', maxLength: 255 },
    title: { type: 'string', maxLength: 500 },
    description: { type: 'string', maxLength: 1000 },
    status: { 
      type: 'string', 
      enum: ['not_started', 'in_progress', 'blocked', 'final_check', 'done'],
      maxLength: 50
    },
    order: { type: 'number', multipleOf: 1, minimum: 0, maximum: 100 },
    createdAt: { type: 'number', multipleOf: 1, minimum: 0 },
    updatedAt: { type: 'number', multipleOf: 1, minimum: 0 },
  },
  required: ['id', 'taskId', 'userId', 'title', 'status', 'order', 'createdAt', 'updatedAt'],
  indexes: ['taskId', 'userId', 'status', 'order'],
}
