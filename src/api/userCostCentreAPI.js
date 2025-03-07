import axios from "axios";

// Base URL for all user cost centre APIs
const API_BASE_URL = '/api/userscostcentres';




export const fetchUserCostCentres = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/viewuserassignedcostcentres`);
    console.log('fetchUserCostCentres response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchUserCostCentres:', error);
    throw error;
  }
};

// Get users with cost centre applicable but not yet assigned
export const fetchUsersWithCostCentreApplicable = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/userwithcostcentre`);
    console.log('fetchUsersWithCostCentreApplicable response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchUsersWithCostCentreApplicable:', error);
    throw error;
  }
};

// Get unassigned cost centres for a specific user
export const fetchUnassignedCostCentres = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getunassignedcostcentre/${userId}`);
    console.log('fetchUnassignedCostCentres response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in fetchUnassignedCostCentres:', error);
    throw error;
  }
};

// Assign cost centres to a user
export const assignCostCentre = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/assigncostcentre`, data);
    console.log('assignCostCentre response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in assignCostCentre:', error);
    throw error;
  }
};

// Update (add/remove) cost centres for a user
export const updateUserCostCentres = async (data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/updatecostcentre`, data);
    console.log('updateUserCostCentres response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateUserCostCentres:', error);
    throw error;
  }
};

// Delete all cost centres for a user
export const deleteUserCostCentres = async (data) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/deletecostcentre`, { data });
    console.log('deleteUserCostCentres response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in deleteUserCostCentres:', error);
    throw error;
  }
};

// Export as a single object for more flexible importing
export const userCostCentreAPI = {
  fetchUserCostCentres,
  fetchUsersWithCostCentreApplicable,
  fetchUnassignedCostCentres,
  assignCostCentre,
  updateUserCostCentres,
  deleteUserCostCentres
};

export default userCostCentreAPI;