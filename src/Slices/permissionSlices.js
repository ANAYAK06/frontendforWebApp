import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import permissionAPI from '../api/permissionAPI';

// Fetch all permissions/workflows
export const fetchAllPermissionsThunk = createAsyncThunk(
  'permission/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.fetchAllPermissions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch a single permission/workflow by ID
export const fetchPermissionByIdThunk = createAsyncThunk(
  'permission/fetchById',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.fetchPermissionById(workflowId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch permissions by role
export const fetchPermissionsByRoleThunk = createAsyncThunk(
  'permission/fetchByRole',
  async (roleId, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.fetchPermissionsByRole(roleId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new workflow 
export const createPermissionThunk = createAsyncThunk(
  'permission/create',
  async (workflowData, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.createPermission(workflowData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an existing workflow
export const updatePermissionThunk = createAsyncThunk(
  'permission/update',
  async ({ workflowId, workflowData }, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.updatePermission(workflowId, workflowData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Legacy save method (for backward compatibility)
export const savePermissionThunk = createAsyncThunk(
  'permission/save',
  async (workflowData, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.savePermission(workflowData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a workflow
export const deletePermissionThunk = createAsyncThunk(
  'permission/delete',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.deletePermission(workflowId);
      return { ...response, workflowId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Check for pending workflows
export const checkPendingWorkflowsThunk = createAsyncThunk(
  'permission/checkPending',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.checkPendingWorkflows(workflowId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Check if a workflow can be deleted
export const canDeleteWorkflowThunk = createAsyncThunk(
  'permission/canDelete',
  async (workflowId, { rejectWithValue }) => {
    try {
      const response = await permissionAPI.canDeleteWorkflow(workflowId);
      return { ...response, workflowId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Data states
  workflows: [],
  currentWorkflow: null,
  roleWorkflows: [],
  pendingWorkflows: [],
  canDeleteStatus: {},
  
  // Loading states
  loading: {
    fetchAll: false,
    fetchById: false,
    fetchByRole: false,
    create: false,
    update: false,
    save: false,
    delete: false,
    checkPending: false,
    canDelete: false
  },
  
  // Error states
  errors: {
    fetchAll: null,
    fetchById: null,
    fetchByRole: null,
    create: null,
    update: null,
    save: null,
    delete: null,
    checkPending: null,
    canDelete: null
  },
  
  // Success states
  success: {
    create: false,
    update: false,
    save: false,
    delete: false
  }
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    // Reset entire state
    resetPermissionState: () => initialState,
    
    // Reset all errors
    clearErrors: (state) => {
      state.errors = initialState.errors;
    },
    
    // Reset all success flags
    clearSuccess: (state) => {
      state.success = initialState.success;
    },
    
    // Reset specific states
    clearOperationState: (state, action) => {
      const operation = action.payload;
      if (operation) {
        state.loading[operation] = false;
        state.errors[operation] = null;
        if (state.success[operation] !== undefined) {
          state.success[operation] = false;
        }
      }
    },

    // Set current workflow (useful for edit operations)
    setCurrentWorkflow: (state, action) => {
      state.currentWorkflow = action.payload;
    },

    // Clear current workflow
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all workflows
      .addCase(fetchAllPermissionsThunk.pending, (state) => {
        state.loading.fetchAll = true;
        state.errors.fetchAll = null;
      })
      .addCase(fetchAllPermissionsThunk.fulfilled, (state, action) => {
        state.loading.fetchAll = false;
        state.workflows = action.payload;
      })
      .addCase(fetchAllPermissionsThunk.rejected, (state, action) => {
        state.loading.fetchAll = false;
        state.errors.fetchAll = action.payload;
      })
      
      // Fetch workflow by ID
      .addCase(fetchPermissionByIdThunk.pending, (state) => {
        state.loading.fetchById = true;
        state.errors.fetchById = null;
      })
      .addCase(fetchPermissionByIdThunk.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(fetchPermissionByIdThunk.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.errors.fetchById = action.payload;
      })
      
      // Fetch workflows by role
      .addCase(fetchPermissionsByRoleThunk.pending, (state) => {
        state.loading.fetchByRole = true;
        state.errors.fetchByRole = null;
      })
      .addCase(fetchPermissionsByRoleThunk.fulfilled, (state, action) => {
        state.loading.fetchByRole = false;
        state.roleWorkflows = action.payload;
      })
      .addCase(fetchPermissionsByRoleThunk.rejected, (state, action) => {
        state.loading.fetchByRole = false;
        state.errors.fetchByRole = action.payload;
      })
      
      // Create workflow
      .addCase(createPermissionThunk.pending, (state) => {
        state.loading.create = true;
        state.errors.create = null;
        state.success.create = false;
      })
      .addCase(createPermissionThunk.fulfilled, (state, action) => {
        state.loading.create = false;
        state.success.create = true;
        // Add the new workflow to the list if it's not already there
        const exists = state.workflows.some(wf => wf.workflowId === action.payload.workflow.workflowId);
        if (!exists) {
          state.workflows.push(action.payload.workflow);
        }
      })
      .addCase(createPermissionThunk.rejected, (state, action) => {
        state.loading.create = false;
        state.errors.create = action.payload;
        state.success.create = false;
      })
      
      // Update workflow
      .addCase(updatePermissionThunk.pending, (state) => {
        state.loading.update = true;
        state.errors.update = null;
        state.success.update = false;
      })
      .addCase(updatePermissionThunk.fulfilled, (state, action) => {
        state.loading.update = false;
        state.success.update = true;
        // Update the workflow in the list
        const index = state.workflows.findIndex(wf => wf.workflowId === action.payload.workflow.workflowId);
        if (index !== -1) {
          state.workflows[index] = action.payload.workflow;
        }
        // Update current workflow if it's the same one
        if (state.currentWorkflow && state.currentWorkflow.workflowId === action.payload.workflow.workflowId) {
          state.currentWorkflow = action.payload.workflow;
        }
      })
      .addCase(updatePermissionThunk.rejected, (state, action) => {
        state.loading.update = false;
        state.errors.update = action.payload;
        state.success.update = false;
      })
      
      // Legacy save method
      .addCase(savePermissionThunk.pending, (state) => {
        state.loading.save = true;
        state.errors.save = null;
        state.success.save = false;
      })
      .addCase(savePermissionThunk.fulfilled, (state, action) => {
        state.loading.save = false;
        state.success.save = true;
        // We'll fetch the updated list rather than trying to update the state directly
      })
      .addCase(savePermissionThunk.rejected, (state, action) => {
        state.loading.save = false;
        state.errors.save = action.payload;
        state.success.save = false;
      })
      
      // Delete workflow
      .addCase(deletePermissionThunk.pending, (state) => {
        state.loading.delete = true;
        state.errors.delete = null;
        state.success.delete = false;
      })
      .addCase(deletePermissionThunk.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.success.delete = true;
        // Remove the workflow from the list
        state.workflows = state.workflows.filter(wf => wf.workflowId !== action.payload.workflowId);
        // Clear current workflow if it's the same one
        if (state.currentWorkflow && state.currentWorkflow.workflowId === action.payload.workflowId) {
          state.currentWorkflow = null;
        }
      })
      .addCase(deletePermissionThunk.rejected, (state, action) => {
        state.loading.delete = false;
        state.errors.delete = action.payload;
        state.success.delete = false;
      })
      
      // Check pending workflows
      .addCase(checkPendingWorkflowsThunk.pending, (state) => {
        state.loading.checkPending = true;
        state.errors.checkPending = null;
      })
      .addCase(checkPendingWorkflowsThunk.fulfilled, (state, action) => {
        state.loading.checkPending = false;
        state.pendingWorkflows = action.payload;
      })
      .addCase(checkPendingWorkflowsThunk.rejected, (state, action) => {
        state.loading.checkPending = false;
        state.errors.checkPending = action.payload;
      })
      
      // Check if can delete
      .addCase(canDeleteWorkflowThunk.pending, (state) => {
        state.loading.canDelete = true;
        state.errors.canDelete = null;
      })
      .addCase(canDeleteWorkflowThunk.fulfilled, (state, action) => {
        state.loading.canDelete = false;
        state.canDeleteStatus = {
          ...state.canDeleteStatus,
          [action.payload.workflowId]: action.payload.canDelete
        };
      })
      .addCase(canDeleteWorkflowThunk.rejected, (state, action) => {
        state.loading.canDelete = false;
        state.errors.canDelete = action.payload;
      })
  }
});

export const {
  resetPermissionState,
  clearErrors,
  clearSuccess,
  clearOperationState,
  setCurrentWorkflow,
  clearCurrentWorkflow
} = permissionSlice.actions;

export default permissionSlice.reducer;