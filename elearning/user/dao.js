import User from "./model.js";

export const createUser = async (user) => {
  try {
    const newUser = new User(user);
    return await newUser.save();
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

export const findAllUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    throw new Error(`Error finding users: ${error.message}`);
  }
};

export const findUserById = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    throw new Error(`Error finding user by ID: ${error.message}`);
  }
};

export const findUserByUsername = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    throw new Error(`Error finding user by username: ${error.message}`);
  }
};

export const findUsersByRole = async (role) => {
  try {
    return await User.find({ role });
  } catch (error) {
    throw new Error(`Error finding users by role: ${error.message}`);
  }
};

export const updateUser = async (id, user) => {
  try {
    return await User.findByIdAndUpdate(id, user, { new: true });
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

export const deleteUser = async (id) => {
  try {
    return await User.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};
