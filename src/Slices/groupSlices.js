import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGroups, createSubgroup, checkGroupNameExists,fetchGroupsForVerification, verifyGroup, rejectGroup } from '../api/groupAPI';

export const fetchAccountGroups = createAsyncThunk(
    'group/fetchAccountGroups',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchGroups();
            
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNewSubgroup = createAsyncThunk(
    'group/createNewSubgroup',
    async (subgroupData, { rejectWithValue }) => {
        try {
            const response = await createSubgroup(subgroupData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to create subgroup');
        }
    }
);

export const checkSubgroupNameExists = createAsyncThunk(
    'group/checkSubgroupNameExists',
    async (groupName, { rejectWithValue }) => {
        try {
            const response = await checkGroupNameExists(groupName);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to check group name');
        }
    }
);
export const fetchGroupsForVerificationThunk = createAsyncThunk(
    'group/fetchGroupsForVerification',
    async (userRoleId, { rejectWithValue }) => {
        try {
            const response = await fetchGroupsForVerification(userRoleId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch groups for verification');
        }
    }
);

export const verifyGroupThunk = createAsyncThunk(
    'group/verifyGroup',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await verifyGroup(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to verify group');
        }
    }
);

export const rejectGroupThunk = createAsyncThunk(
    'group/rejectGroup',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await rejectGroup(id, remarks);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to reject group');
        }
    }
);

const groupSlice = createSlice({
    name: 'group',
    initialState: {
        groups: [],
        subgroups: [],
        groupsForVerification: [],
        loading: false,
        error: null,
        createdSubgroup: null,
        subgroupSuccess: false,
        loadingGroup: false,
        errorGroup: null,
        successGroup: false,
        nameExists: false,
        verificationLoading: false,
        verificationError: null,
        verificationSuccess: false,
        rejectionSuccess: false,
    },
    reducers: {
        resetCreatedSubgroup: (state) => {
            state.createdSubgroup = null;
            state.subgroupSuccess = false;
        },
        resetNameExists: (state) => {
            state.nameExists = false;
        },
        resetSubgroupSuccess: (state) => {
            state.subgroupSuccess = false;
        },
        resetVerificationStatus: (state) => {
            state.verificationSuccess = false;
            state.verificationError = null;
        },
        rejectSuccess: (state) => {
            state.rejectionSuccess = true;
        },
        resetRejectionStatus:(state) => {
            state.rejectionSuccess =false;
            state.verificationError = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountGroups.pending, (state) => {
                state.loadingGroup = true;
                state.errorGroup = null;
            })
            .addCase(fetchAccountGroups.fulfilled, (state, action) => {
                state.loadingGroup = false;
                state.groups = action.payload;
                
            })
            .addCase(fetchAccountGroups.rejected, (state, action) => {
                state.loadingGroup = false;
                state.errorGroup = action.payload;
            })
            .addCase(createNewSubgroup.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.subgroupSuccess = false;
            })
            .addCase(createNewSubgroup.fulfilled, (state, action) => {
                state.loading = false;
                state.createdSubgroup = action.payload.subgroup;
                state.subgroups.push(action.payload.subgroup);
                state.subgroupSuccess = true;
            })
            .addCase(createNewSubgroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.subgroupSuccess = false;
            })
            .addCase(checkSubgroupNameExists.fulfilled, (state, action) => {
                state.nameExists = action.payload.exists;
            })
            .addCase(fetchGroupsForVerificationThunk.pending, (state) => {
                state.verificationLoading = true;
                state.verificationError = null;
            })
            .addCase(fetchGroupsForVerificationThunk.fulfilled, (state, action) => {
                state.verificationLoading = false;
                state.groupsForVerification = action.payload.groups;
            })
            .addCase(fetchGroupsForVerificationThunk.rejected, (state, action) => {
                state.verificationLoading = false;
                state.verificationError = action.payload;
            })
            .addCase(verifyGroupThunk.pending, (state) => {
                state.verificationLoading = true;
                state.verificationError = null;
            })
            .addCase(verifyGroupThunk.fulfilled, (state, action) => {
                state.verificationLoading = false;
                state.verificationSuccess = true;
                state.groupsForVerification = state.groupsForVerification.filter(group => group._id !== action.payload.group._id);
            })
            .addCase(verifyGroupThunk.rejected, (state, action) => {
                state.verificationLoading = false;
                state.verificationError = action.payload;
            })
            .addCase(rejectGroupThunk.pending, (state) => {
                state.verificationLoading = true;
                state.verificationError = null;
                state.rejectionSuccess = false
            })
            .addCase(rejectGroupThunk.fulfilled, (state, action) => {
                state.verificationLoading = false;
                state.rejectionSuccess = true
                state.groupsForVerification = state.groupsForVerification.filter(group => group._id !== action.payload.group._id);
            })
            .addCase(rejectGroupThunk.rejected, (state, action) => {
                state.verificationLoading = false;
                state.verificationError = action.payload;
                state.rejectionSuccess = false
            });
    }
});

export const { resetCreatedSubgroup, resetSubgroupSuccess, resetNameExists, resetVerificationStatus, rejectSuccess, resetRejectionStatus } = groupSlice.actions;

export default groupSlice.reducer;