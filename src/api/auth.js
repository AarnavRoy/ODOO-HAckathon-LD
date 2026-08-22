import { mockUsers } from './mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const signup = async ({ name, email, password }) => {
  await delay();
  const newUser = {
    id: mockUsers.length + 1,
    name,
    email,
    passwordHash: 'hashed_' + password,
    profilePhotoUrl: '',
    languagePreference: 'English',
    createdAt: new Date().toISOString().split('T')[0]
  };
  mockUsers.push(newUser);
  return { token: 'mock-jwt-token', user: newUser };
};

export const login = async ({ email, password }) => {
  await delay();
  const user = mockUsers.find(u => u.email === email);
  if (!user) throw new Error('User not found');
  return { token: 'mock-jwt-token', user };
};

export const forgotPassword = async ({ email }) => {
  await delay();
  return { message: 'Password reset link sent' };
};

export const getMe = async () => {
  await delay();
  return { user: mockUsers[0] };
};

export const updateMe = async ({ name, profilePhotoUrl, languagePreference }) => {
  await delay();
  mockUsers[0] = { ...mockUsers[0], name, profilePhotoUrl, languagePreference };
  return { user: mockUsers[0] };
};

export const deleteMe = async () => {
  await delay();
  return { message: 'Account deleted' };
};
