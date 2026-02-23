import { DataTypes } from 'sequelize';
import { sequelize } from '../../configs/db.js';
import { generateUserId } from '../../helpers/uuid-generator.js';
import { User } from '../users/user.model.js';

export const Post = sequelize.define('Post', {
  Id: {
    type: DataTypes.STRING(16),
    primaryKey: true,
    field: 'id',
    defaultValue: () => generateUserId(),
  },
  Title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'title'
  },
  Category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'category'
  },
  Content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content'
  },
  UserId: {
    type: DataTypes.STRING(16),
    allowNull: false,
    field: 'user_id',
    references: { model: User, key: 'id' }
  }
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

User.hasMany(Post, { foreignKey: 'user_id', as: 'Posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });