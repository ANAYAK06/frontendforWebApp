import axios from "axios";

const API_BASE_URL = '/api/clientboq';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if(!token) {
        throw new Error('No token found');
    }
    return {Authorization: `Bearer ${token}`};
};


// Helper function to create FormData for BOQ
export const createBOQFormData = (boqData) => {
    const formData = new FormData();
    
    // Append Excel file if provided
    if (boqData.excelFile) {
        formData.append('excelFile', boqData.excelFile);
    }
    
    // Append PDF attachments if provided
    if (boqData.attachments) {
        boqData.attachments.forEach(file => {
            formData.append('attachments', file);
            // If we have named attachments, append the names
            if (file.customName) {
                formData.append('attachmentNames', file.customName);
            }
        });
    }
    
    // Append other BOQ data
    formData.append('businessOpportunityId', boqData.businessOpportunityId);
    if (boqData.remarks) {
        formData.append('remarks', boqData.remarks);
    }
    
    // Append checklist data if provided
    if (boqData.checklistId) {
        formData.append('checklistId', boqData.checklistId);
    }
    if (boqData.checklistItems) {
        formData.append('checklistItems', JSON.stringify(boqData.checklistItems));
    }
    
    return formData;
};

// BOQ APIs

// Create new BOQ with file upload
export const createBOQ = async (formData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/createboq`,
            formData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'  // Important for file upload
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get BOQs for verification
export const fetchBOQsForVerification = async (userRoleId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getboqforverification`,
            {
                params: { userRoleId },
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Update BOQ status with optional file upload
// In your API file
export const updateBOQStatus = async (id, updateData) => {
    try {
        console.log('API call with data:', {
            id,
            updateData
        });

        const response = await axios.put(
            `${API_BASE_URL}/updateboq/${id}`,
            updateData,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API error:', error.response?.data);
        throw error;
    }
};
// Reject BOQ
export const rejectBOQ = async (id, remarks) => {
    try {
        console.log('Rejecting BOQ:', { id, remarks });
        const response = await axios.put(
            `${API_BASE_URL}/rejectboq/${id}`,
            { id, remarks }, // Include both id and remarks in the request body
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Reject BOQ Error:', error.response || error);
        throw error.response?.data || error;
    }
};
// Get all BOQs
export const getAllBOQs = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getallboq`,
            {
                headers: getAuthHeader(),
            }
        );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Get accepted BOQs
export const getAcceptedBOQs = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/getacceptedboq`,
            {
                headers: getAuthHeader(),
            }
        );
        
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// Checklist APIs

export const getChecklists = async (category = null) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/checklists`,
            {
                params: category ? { category } : {},
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Create new checklist with initial items
export const createChecklist = async (checklistData) => {
    try {
        console.log('checklist data is', checklistData)
        const response = await axios.post(
            `${API_BASE_URL}/checklists`,
            {
                name: checklistData.name,
                items: checklistData.items || []
            },
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        console.error('Create checklist error:', error.response?.data || error);
        throw error.response?.data || error;
    }
};

// Get single checklist by ID
export const getChecklistById = async (checklistId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/checklists/${checklistId}`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Add new items to existing checklist
export const addChecklistItems = async (checklistId, items) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/checklists/${checklistId}/items`,
            { items },
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update entire checklist
export const updateChecklist = async (checklistId, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/checklists/${checklistId}`,
            updateData,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete checklist
export const deleteChecklist = async (checklistId) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/checklists/${checklistId}`,
            {
                headers: getAuthHeader()
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};


// Helper functions

