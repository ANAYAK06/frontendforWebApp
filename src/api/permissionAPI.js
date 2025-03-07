import axios from "axios";

// Base URL for all permission APIs
const API_BASE_URL = '/api/permissions';

// Get all permissions/workflows
export const fetchAllPermissions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rolepermissions`);
    console.log('fetchAllPermissions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchAllPermissions:', error);
    throw error;
  }
};

// Get a single permission/workflow by ID
export const fetchPermissionById = async (workflowId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rolepermissions/${workflowId}`);
    console.log('fetchPermissionById response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchPermissionById:', error);
    throw error;
  }
};

// Get permissions by role
export const fetchPermissionsByRole = async (roleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rolepermissions/role?roleId=${roleId}`);
    console.log('fetchPermissionsByRole response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchPermissionsByRole:', error);
    throw error;
  }
};

// Create a new workflow (RESTful approach)
export const createPermission = async (workflowData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rolepermissions/create`, workflowData);
    console.log('createPermission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createPermission:', error);
    throw error;
  }
};

// Update an existing workflow (RESTful approach)
export const updatePermission = async (workflowId, workflowData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/rolepermissions/${workflowId}`, workflowData);
    console.log('updatePermission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updatePermission:', error);
    throw error;
  }
};

// Legacy method that handles both create and update (for backward compatibility)
export const savePermission = async (workflowData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rolepermissions`, workflowData);
    console.log('savePermission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in savePermission:', error);
    throw error;
  }
};

// Delete a workflow
export const deletePermission = async (workflowId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/rolepermissions/${workflowId}`);
    console.log('deletePermission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deletePermission:', error);
    throw error;
  }
};

// Check for pending workflows associated with a workflow
export const checkPendingWorkflows = async (workflowId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pending-workflows/${workflowId}`);
    console.log('checkPendingWorkflows response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in checkPendingWorkflows:', error);
    throw error;
  }
};

// Check if a workflow can be deleted
export const canDeleteWorkflow = async (workflowId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/can-delete-workflow/${workflowId}`);
    console.log('canDeleteWorkflow response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in canDeleteWorkflow:', error);
    throw error;
  }
};

// Export as a single object for more flexible importing
export const permissionAPI = {
  fetchAllPermissions,
  fetchPermissionById,
  fetchPermissionsByRole,
  createPermission,
  updatePermission,
  savePermission,
  deletePermission,
  checkPendingWorkflows,
  canDeleteWorkflow
};

export default permissionAPI;