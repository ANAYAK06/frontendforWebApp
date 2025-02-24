import axios from "axios";

const API_BASE_URL = '/api/itemcodeunit';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }
    return { Authorization: `Bearer ${token}` };
};

// Create new unit
export const createUnit = async (unitData) => {
    try {
        console.log('Sending unit data to API:', unitData);
        const response = await axios.post(
            `${API_BASE_URL}/create`,
            unitData,
            {
                headers: getAuthHeader(),
            }
        );
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error Details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        if (error.response) {
            throw new Error(
                error.response.data.message || 
                JSON.stringify(error.response.data)
            ) 
        } else if (error.request) {
            throw new Error('No response received from server');
        } else {
            throw new Error(error.message);
        }
    }
};

// Bulk upload units
export const bulkUploadUnits = async (unitsData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/bulk-upload`,
            unitsData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get units for verification
export const getUnitsForVerification = async (userRoleId) => {
    try {
        console.log('Calling API with userRoleId:', userRoleId);
        const response = await axios.get(
            `${API_BASE_URL}/verification`,
            {
                params: { userRoleId },
                headers: getAuthHeader(),
            }
        );
        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Verify single unit
export const verifyUnit = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/verify/${id}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Verify batch of units
export const verifyBatchUnits = async (batchId, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/verify/batch/${batchId}`,
            { remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};




export const rejectUnit = async (id, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/reject`,
            { id, remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to reject unit');
    }
};

// Reject batch of units
export const rejectBatchUnits = async (batchId, remarks) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/reject`,
            { batchId, remarks },
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to reject batch units');
    }
};
;
// Get all units
export const getAllUnits = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get units by type
export const getUnitsByType = async (type, excludeUnit = null) => {
    try {
        console.log('Fetching units for type:', type);
        
        let url = `${API_BASE_URL}/units/type/${type}`;
        if (excludeUnit) {
            url += `?excludeUnit=${excludeUnit}`;
        }

        console.log('Request URL:', url);

        const response = await axios.get(url, {
            headers: getAuthHeader()
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching units:', {
            type,
            error: error.response?.data || error.message
        });
        throw error.response?.data || error;
    }
};

// Get unit by ID
export const getUnitById = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/${id}`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get unit history
export const getUnitHistory = async (id) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/${id}/history`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Update unit
export const updateUnit = async (id, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/${id}`,
            updateData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Update conversion
export const updateConversion = async (conversionData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/conversion`,
            conversionData,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get unit conversions
export const getUnitConversions = async (unitSymbol) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/conversion/${unitSymbol}`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getUnitsByCategory = async (category) => {
    try {
        console.log('Fetching units for category:', category);
        
        const response = await axios.get(
            `${API_BASE_URL}/unit/${category}`,
            {
                headers: getAuthHeader()
            }
        );

        console.log('Units by category response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching units by category:', {
            category,
            error: error.response?.data || error.message
        });
        
        if (error.response) {
            throw new Error(
                error.response.data.message || 
                JSON.stringify(error.response.data)
            );
        } else if (error.request) {
            throw new Error('No response received from server');
        } else {
            throw new Error(error.message || 'An unknown error occurred');
        }
    }
};

// Get allowed units based on primary unit
export const getAllowedUnitsByPrimaryUnit = async (primaryUnit) => {
    try {
        console.log('Fetching allowed units for primary unit:', primaryUnit);
        
        const response = await axios.get(
            `${API_BASE_URL}/allowed/${primaryUnit}`,
            {
                headers: getAuthHeader()
            }
        );

        console.log('Allowed units response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching allowed units:', {
            primaryUnit,
            error: error.response?.data || error.message
        });
        
        if (error.response) {
            throw new Error(
                error.response.data.message || 
                JSON.stringify(error.response.data)
            );
        } else if (error.request) {
            throw new Error('No response received from server');
        } else {
            throw new Error('Failed to fetch allowed units');
        }
    }
};
