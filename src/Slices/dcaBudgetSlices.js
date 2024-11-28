
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchEligibleCCs as EligibleCCsAPI,
    fetchDCAForCC as DCAforCCAPI,
    assignDCABudget as assignDCABudgetAPI,
    fetchFiscalYearsForCC as fetchFiscalYearForCCAPI,
    fetchBudgetForCCAndFiscalYear as fetchBudgetForCCAndFiscalYearAPI,
    getDCABudgetForVerification as getDCABudgetForVerificationAPI,
    updateDCABudget as updateDCABudgetAPI,
    rejectDCABudget as rejectDCABudgetAPI

 } from "../api/dcaBudgetAPI"; 


 export const fetchEligibleCCs = createAsyncThunk(
    'dcaBudget/fetchEligibleCCs',
    async({ccid, subId}, {rejectWithValue}) => {
        try {
            return await EligibleCCsAPI(ccid, subId)
        } catch (error) {
            return rejectWithValue(error)
            
        }
    }
 )

 export const fetchDCAForCC = createAsyncThunk(
    'dcaBudget/fetchDCAsforCC',
    async({ccid, subId, ccNo}, {rejectWithValue}) => {
        try {
            return await DCAforCCAPI(ccid, subId, ccNo)
        } catch (error) {
            return rejectWithValue(error)
            
        }
    }
 )

 export const assignDCABudget = createAsyncThunk(
    'dcaBudget/assignDCABudget',
    async(data, {rejectWithValue}) => {
        try {
            return await assignDCABudgetAPI(data)
        } catch (error) {
            return rejectWithValue(error)
        }
    }
 )
 export const fetchFiscalYearsForCC = createAsyncThunk(
    'dcaBudget/fetchFiscalYearsForCC',
    async (ccNo, { rejectWithValue }) => {
        try {
            return await fetchFiscalYearForCCAPI(ccNo);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);
export const fetchBudgetForCCAndFiscalYear = createAsyncThunk(
    'dcaBudget/fetchBudgetForCCAndFiscalYear',
    async ({ ccNo, fiscalYear }, { rejectWithValue }) => {
        try {
            return await fetchBudgetForCCAndFiscalYearAPI(ccNo, fiscalYear);
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchDCABudgetForVerification = createAsyncThunk(
    'dcaBudget/fetchDCABudgetForVerification',
    async(payload, {rejectWithValue}) => {
       try {

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
       
        const response = await getDCABudgetForVerificationAPI(
            payload.userRoleId, token
        
        )

        console.log('API Response:', response);

         
        return response
       
       } catch (error) {
        return rejectWithValue(error.message || 'Failed to fetch dac budget')
        
       }
    }

)
export const updateDCABudget = createAsyncThunk(
    'dcaBudget/updateDCABudget',
    async({referenceNumber, remarks}, {rejectWithValue}) => {
        try {
            const response = await updateDCABudgetAPI(referenceNumber, remarks);
            return response
        } catch (error) {
            return rejectWithValue(error)
            
        }
    }
)

export const rejectDCABudget = createAsyncThunk(
    'dcaBudget/rejectDCABudget',
    async({referenceNumber, remarks}, {rejectWithValue}) => {
        try {
            const response = await rejectDCABudgetAPI(referenceNumber, remarks)
            return response
        } catch (error) {
            return rejectWithValue(error)
        }
    }
)

 const dcaBudgetSlice = createSlice({
    name:'dcaBudget',
    initialState: {
        eligibleCCs:[],
        dcaList:[],
        fiscalYears:[],
        selectedBudget:null,
        dcaBudgetForVerification:[],
        loading:false,
        error:null,
        assignmentSuccess:false,
        updateSuccess:false,
        rejectSuccess:false,
        referenceNumber:null,
        initialLoadComplete: false, // New state to track initial load
    },
    reducers:{
        resetRejectSuccess: (state) => {
            state.rejectSuccess = false
        },
        resetAssignmentSuccess: (state) => {
            state.assignmentSuccess = false
        },
        resetUpdateSuccess: (state) => {
            state.updateSuccess = false
        },
        setReferenceNumber: (state, action) => {
            state.referenceNumber = action.payload;
        },
        clearReferenceNumber: (state) => {
            state.referenceNumber = null;
        },
        resetState: (state) => {
            state.dcaBudgetForVerification = [];
            state.loading = false;
            state.error = null;
            state.updateSuccess = false;
            state.rejectSuccess = false;
            state.initialLoadComplete = false;
        }
       
    },
    extraReducers:(builder) => {
        builder
        .addCase(fetchEligibleCCs.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchEligibleCCs.fulfilled, (state, action) => {
            state.loading = false;
            state.eligibleCCs = action.payload
        })
        .addCase(fetchEligibleCCs.rejected, (state, action) => {
            state.loading = true;
            state.error = action.payload

        })
        .addCase(fetchDCAForCC.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchDCAForCC.fulfilled, (state, action) => {
            state.loading = false;
            state.dcaList = action.payload
        })
        .addCase(fetchDCAForCC.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload
        })
        .addCase(assignDCABudget.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.assignmentSuccess = false;
        })
        .addCase(assignDCABudget.fulfilled, (state, action) => {
            state.loading = false;
            state.assignmentSuccess = true
            state.referenceNumber = action.payload.referenceNumber
        })
        .addCase(assignDCABudget.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.assignmentSuccess = false
        })
        .addCase(fetchFiscalYearsForCC.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchFiscalYearsForCC.fulfilled, (state, action) => {
            state.loading = false;
            state.fiscalYears = action.payload;
        })
        .addCase(fetchFiscalYearsForCC.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(fetchBudgetForCCAndFiscalYear.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchBudgetForCCAndFiscalYear.fulfilled, (state, action) => {
            state.loading = false;
            state.selectedBudget = action.payload;
            
        })
        .addCase(fetchBudgetForCCAndFiscalYear.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(fetchDCABudgetForVerification.pending, (state) => {
            state.loading = true;
            state.error = null
        })
        .addCase(fetchDCABudgetForVerification.fulfilled, (state, action) => {
            state.loading = false;
            
            state.dcaBudgetForVerification = action.payload.dcaBudgets.map(budget =>({
                ...budget,
                referenceNumber:budget.referenceNumber,
                
            }))
            state.initialLoadComplete = true;
        })
        .addCase(fetchDCABudgetForVerification.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload
            state.initialLoadComplete = true;
        })
        .addCase(updateDCABudget.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.updateSuccess = false;
        })
        .addCase(updateDCABudget.fulfilled, (state)=> {
            state.loading = false;
            state.updateSuccess = true;
        })
        .addCase(updateDCABudget.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.updateSuccess = false
        })
        .addCase(rejectDCABudget.pending, (state)=> {
            state.loading = true;
            state.error = null;
            state.rejectSuccess = false
        })
        .addCase(rejectDCABudget.fulfilled, (state) => {
            state.loading = false;
            state.rejectSuccess = true
        })
        .addCase(rejectDCABudget.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload
            state.rejectSuccess = false
        })
    }
 })

 export const {resetAssignmentSuccess, resetUpdateSuccess, resetRejectSuccess, setReferenceNumber, clearReferenceNumber, resetState} = dcaBudgetSlice.actions

 export default dcaBudgetSlice.reducer