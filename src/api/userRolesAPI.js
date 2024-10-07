import axios from 'axios';

export const fetchUserRoles = async () => {
    const response = await axios.get('/api/roles/useroles');
    return response.data;
};

export const updateUserRoles = async ({ id, roleName,isCostCentreApplicable, costCentreTypes }) => {
    const response = await axios.patch(`/api/roles/useroles/${id}`, { roleName, costCentreTypes, isCostCentreApplicable });
    return response.data;
};

export const deleteUserRole = async (id) => {
    await axios.delete(`/api/roles/useroles/${id}`);
    return id;
};

export const createUserRole = async ({ roleName,isCostCentreApplicable, ccid }) => {
    const response = await axios.post('api/roles/useroles', { roleName, isCostCentreApplicable,  ccid });
    return response.data;
};

