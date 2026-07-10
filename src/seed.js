require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Log = require('./models/Log');
const { ROLES, LOG_ACTIONS } = require('./utils/constants');

/**
 * Seed Script
 * Creates sample users with different roles and sample logs
 * Satisfies submission requirements #3 (sample users) and #4 (sample logs)
 */

const sampleUsers = [
  {
    name: 'Super Admin User',
    mobile: '9000000001',
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  },
  {
    name: 'Admin User',
    mobile: '9000000002',
    role: ROLES.ADMIN,
    isActive: true,
  },
  {
    name: 'Manager User',
    mobile: '9000000003',
    role: ROLES.MANAGER,
    isActive: true,
  },
  {
    name: 'Regular User',
    mobile: '9000000004',
    role: ROLES.USER,
    isActive: true,
  },
  {
    name: 'Inactive User',
    mobile: '9000000005',
    role: ROLES.USER,
    isActive: false,
  },
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rbac_otp_db';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Log.deleteMany({});
    console.log('Cleared existing users and logs.\n');

    // Insert sample users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log('✅ Sample Users Created:');
    console.log('─'.repeat(80));
    console.log(
      'Name'.padEnd(20),
      'Mobile'.padEnd(15),
      'Role'.padEnd(15),
      'Active'.padEnd(10),
      'ID'
    );
    console.log('─'.repeat(80));
    createdUsers.forEach((user) => {
      console.log(
        user.name.padEnd(20),
        user.mobile.padEnd(15),
        user.role.padEnd(15),
        String(user.isActive).padEnd(10),
        user._id.toString()
      );
    });
    console.log('');

    // Create sample logs
    const superAdmin = createdUsers[0];
    const adminUser = createdUsers[1];
    const regularUser = createdUsers[3];

    const sampleLogs = [
      {
        userId: null,
        mobile: '9000000001',
        action: LOG_ACTIONS.OTP_GENERATED,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.36.0',
        message: 'OTP generated for mobile 9000000001',
      },
      {
        userId: null,
        mobile: '9000000001',
        action: LOG_ACTIONS.OTP_VERIFIED,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.36.0',
        message: 'OTP verified for mobile 9000000001',
      },
      {
        userId: superAdmin._id,
        mobile: '9000000001',
        action: LOG_ACTIONS.LOGIN_SUCCESS,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.36.0',
        message: 'User logged in successfully: 9000000001',
      },
      {
        userId: null,
        mobile: '9999999999',
        action: LOG_ACTIONS.OTP_INVALID,
        status: 'FAILURE',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        message: 'Invalid OTP. 2 attempt(s) remaining.',
      },
      {
        userId: null,
        mobile: '9999999999',
        action: LOG_ACTIONS.LOGIN_FAILED,
        status: 'FAILURE',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        message: 'Login failed for mobile 9999999999',
      },
      {
        userId: null,
        mobile: '9000000006',
        action: LOG_ACTIONS.OTP_EXPIRED,
        status: 'FAILURE',
        ipAddress: '10.0.0.50',
        userAgent: 'curl/7.88.1',
        message: 'OTP has expired. Please request a new OTP.',
      },
      {
        userId: superAdmin._id,
        mobile: '9000000004',
        action: LOG_ACTIONS.USER_CREATED,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.36.0',
        message: 'User created: Regular User (9000000004) with role USER by SUPER_ADMIN',
      },
      {
        userId: superAdmin._id,
        mobile: '9000000003',
        action: LOG_ACTIONS.ROLE_UPDATED,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.36.0',
        message: 'Role updated for user Manager User (9000000003): USER → MANAGER',
      },
      {
        userId: regularUser._id,
        mobile: '9000000004',
        action: LOG_ACTIONS.ACCESS_DENIED,
        status: 'FAILURE',
        ipAddress: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.36.0',
        message: 'User with role USER attempted to access GET /users',
      },
      {
        userId: superAdmin._id,
        mobile: '9000000005',
        action: LOG_ACTIONS.USER_DELETED,
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'PostmanRuntime/7.36.0',
        message: 'User deleted: Inactive User (9000000005) by SUPER_ADMIN',
      },
    ];

    const createdLogs = await Log.insertMany(sampleLogs);
    console.log('✅ Sample Logs Created:');
    console.log('─'.repeat(80));
    console.log(
      'Action'.padEnd(20),
      'Status'.padEnd(10),
      'Mobile'.padEnd(15),
      'Message'
    );
    console.log('─'.repeat(80));
    createdLogs.forEach((log) => {
      console.log(
        log.action.padEnd(20),
        log.status.padEnd(10),
        (log.mobile || 'N/A').padEnd(15),
        (log.message || '').substring(0, 50)
      );
    });

    console.log('\n✅ Seeding completed successfully!');
    console.log(`   ${createdUsers.length} users created`);
    console.log(`   ${createdLogs.length} logs created`);
    console.log('\n📌 Use these mobile numbers to test OTP login:');
    console.log('   SUPER_ADMIN: 9000000001');
    console.log('   ADMIN:       9000000002');
    console.log('   MANAGER:     9000000003');
    console.log('   USER:        9000000004');
    console.log('   INACTIVE:    9000000005 (should be blocked)\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
