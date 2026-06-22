// FIXED Seed Script - Creates ONLY Admin user

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/school-erp'
)
.then(async () => {

  console.log('🌱 Creating Admin user...');

  const adminEmail = 'admin@schoolerp.com';
  const adminPassword = 'admin123';

  // Delete existing admin
  await User.deleteOne({ email: adminEmail });

  // Create admin WITHOUT hashing
  const admin = new User({
    name: 'School Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin'
  });

  await admin.save();

  console.log('✅ Admin created!');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log('🎉 Login Ready!');

  process.exit(0);

})
.catch(err => {

  console.error('❌ Error:', err);
  process.exit(1);

});