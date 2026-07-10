const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: 'Mobile number must be exactly 10 digits and only numbers',
      },
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Role must be one of: SUPER_ADMIN, ADMIN, MANAGER, USER',
      },
      default: ROLES.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
