import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function generateAccessToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(id) {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function serializeUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    weight: user.weight,
    height: user.height,
    age: user.age,
    gender: user.gender,
    activityLevel: user.activityLevel,
    unitSystem: user.unitSystem,
    accountMode: user.accountMode,
    onboardingComplete: user.onboardingComplete,
    dailyGoals: user.dailyGoals,
  };
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateGoals(weightKg, heightCm, age, gender, activityLevel) {
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  const weightLbs = weightKg * 2.20462;
  const protein = Math.round(weightLbs * 0.8);
  const fatCals = tdee * 0.25;
  const fat = Math.round(fatCals / 9);
  const proteinCals = protein * 4;
  const carbCals = tdee - proteinCals - fatCals;
  const carbs = Math.round(carbCals / 4);

  return { calories: tdee, protein, carbs, fat };
}

export async function register(req, res) {
  const { password, name } = req.validated;
  const email = req.validated.email.toLowerCase();

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    email,
    passwordHash: password,
    name,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    accessToken,
    user: serializeUser(user),
  });
}

export async function login(req, res) {
  const email = req.validated.email.toLowerCase();
  const { password } = req.validated;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);

  res.json({
    accessToken,
    user: serializeUser(user),
  });
}

export async function refresh(req, res) {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    const newRefresh = generateRefreshToken(user._id);
    user.refreshToken = newRefresh;
    await user.save();

    setRefreshCookie(res, newRefresh);

    res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  const token = req.cookies?.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
}

export async function getMe(req, res) {
  const user = await User.findById(req.userId).select('-passwordHash -refreshToken');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(serializeUser(user));
}

export async function updateMe(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, dailyGoals, accountMode, weight, height, age, gender, activityLevel, unitSystem } = req.validated;
  if (name) user.name = name;
  if (accountMode) user.accountMode = accountMode;
  if (weight != null) user.weight = weight;
  if (height != null) user.height = height;
  if (age != null) user.age = age;
  if (gender) user.gender = gender;
  if (activityLevel) user.activityLevel = activityLevel;
  if (unitSystem) user.unitSystem = unitSystem;
  if (dailyGoals) {
    user.dailyGoals = { ...user.dailyGoals.toObject(), ...dailyGoals };
  }

  await user.save();
  res.json(serializeUser(user));
}

export async function completeOnboarding(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const {
    weight, height, age, gender, activityLevel, unitSystem,
    accountMode, dailyGoals, autoCalculate,
  } = req.validated;

  user.weight = weight;
  user.height = height;
  user.age = age;
  user.gender = gender;
  user.activityLevel = activityLevel;
  user.unitSystem = unitSystem || 'imperial';
  user.accountMode = accountMode || 'simple';

  if (accountMode === 'advanced') {
    if (autoCalculate) {
      user.dailyGoals = calculateGoals(weight, height, age, gender, activityLevel);
    } else if (dailyGoals) {
      user.dailyGoals = dailyGoals;
    }
  }

  user.onboardingComplete = true;
  await user.save();

  res.json(serializeUser(user));
}

export async function recalculateGoals(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.weight || !user.height || !user.age || !user.gender || !user.activityLevel) {
    return res.status(400).json({ message: 'Body stats incomplete — update them first' });
  }

  const goals = calculateGoals(user.weight, user.height, user.age, user.gender, user.activityLevel);
  user.dailyGoals = goals;
  await user.save();

  res.json(serializeUser(user));
}

