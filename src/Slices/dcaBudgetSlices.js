
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
        console.log("Fetching DCA budgets with payload:", payload);
        const dcaBudgets = await getDCABudgetForVerificationAPI(payload.userRoleId)

        console.log("API response:", dcaBudgets ); 
        return dcaBudgets
       
       } catch (error) {
        return rejectWithValue(error)
        
       }
    }

)
export const updateDCABudget = createAsyncThunk(
    'dcaBudget/updateDCABudget',
    async({ccNo, remarks}, {rejectWithValue}) => {
        try {
            const response = await updateDCABudgetAPI(ccNo, remarks);
            return response
        } catch (error) {
            return rejectWithValue(error)
            
        }
    }
)

export const rejectDCABudget = createAsyncThunk(
    'dcaBudget/rejectDCABudget',
    async({ccNo, remarks}, {rejectWithValue}) => {
        try {
            const response = await rejectDCABudgetAPI(ccNo, remarks)
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
        rejectSuccess:false
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
        .addCase(assignDCABudget.fulfilled, (state) => {
            state.loading = false;
            state.assignmentSuccess = true
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
            state.dcaBudgetForVerification = action.payload.dcaBudgets
            console.log('updated dca budget for verification' , state.dcaBudgetForVerification)
        })
        .addCase(fetchDCABudgetForVerification.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload
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

 export const {resetAssignmentSuccess, resetUpdateSuccess, resetRejectSuccess} = dcaBudgetSlice.actions

 export default dcaBudgetSlice.reducer