
import axios from "axios";

const API_BASE_URL = '/api/accountsgroup'


const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
      throw new Error('No token found');
  }
  return { Authorization: `Bearer ${token}` };
}



export const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getallaccountsgroups`);

      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  
export const createSubgroup = async (subgroupData) => {
  try {
      const response = await axios.post(`${API_BASE_URL}/create-subgroups`, subgroupData, {
          headers: getAuthHeader(),
      });
      return response.data;
  } catch (error) {
      throw error.response.data;
  }
};

export const checkGroupNameExists = async (groupName) => {
  try {
      const response = await axios.get(`${API_BASE_URL}/checkgroupnameexists`, {
          params: { groupName },
          headers: getAuthHeader(),
      });
      return response.data;
  } catch (error) {
      throw error.response.data;
  }
};

export const fetchGroupsForVerification = async (userRoleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getgroupforverification`, {
      params: { userRoleId },
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const verifyGroup = async (id, remarks) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/verifynewgroup/${id}`, 
      { remarks },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const rejectGroup = async (id, remarks) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/rejectnewgroup/${id}`, 
      { remarks },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};