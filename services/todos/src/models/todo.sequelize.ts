import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import { TodoStatus } from '../types/todo.types';

interface TodoAttributes {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface TodoCreationAttributes extends Optional<TodoAttributes, 'id' | 'description' | 'status' | 'createdAt' | 'updatedAt'> {}

export class TodoModel extends Model<TodoAttributes, TodoCreationAttributes> implements TodoAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public status!: TodoStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TodoModel.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'todos',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  },
);

