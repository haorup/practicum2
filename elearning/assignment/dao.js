import Assignment from "./model.js";

export const createAssignment = async (assignment) => {
  try {
    const newAssignment = new Assignment(assignment);
    return await newAssignment.save();
  } catch (error) {
    throw new Error(`Error creating assignment: ${error.message}`);
  }
};

export const findAllAssignments = async () => {
  try {
    return await Assignment.find();
  } catch (error) {
    throw new Error(`Error finding assignments: ${error.message}`);
  }
};

export const findAssignmentById = async (id) => {
  try {
    return await Assignment.findById(id);
  } catch (error) {
    throw new Error(`Error finding assignment by ID: ${error.message}`);
  }
};



export const updateAssignment = async (id, assignment) => {
  try {
    return await Assignment.findByIdAndUpdate(id, assignment, { new: true });
  } catch (error) {
    throw new Error(`Error updating assignment: ${error.message}`);
  }
};

export const deleteAssignment = async (id) => {
  try {
    return await Assignment.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Error deleting assignment: ${error.message}`);
  }
};
