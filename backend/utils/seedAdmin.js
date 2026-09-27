// Creates (or updates the password of) the single admin/user account.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await User.hashPassword(password);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { email: email.toLowerCase().trim(), passwordHash, name: 'Admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin user ready: ${user.email}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
