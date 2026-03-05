import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: null },
    weight: { type: Number, default: null },
    height: { type: Number, default: null },
    age: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female'], default: null },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: null,
    },
    unitSystem: { type: String, enum: ['imperial', 'metric'], default: 'imperial' },
    accountMode: { type: String, enum: ['simple', 'advanced'], default: 'simple' },
    onboardingComplete: { type: Boolean, default: false },
    dailyGoals: {
      calories: { type: Number, default: 2000 },
      protein: { type: Number, default: 50 },
      carbs: { type: Number, default: 250 },
      fat: { type: Number, default: 65 },
    },
    refreshToken: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
