import { configureStore } from "@reduxjs/toolkit";
import userRoleSlices from "../Slices/userRoleSlices";
import costCentreTypeSlices from "../Slices/costCentreTypeSlices";
import usersSlices from "../Slices/usersSlices";
import authSlices from "../Slices/authSlices";
import userMenuSlices from "../Slices/userMenuSlices";
import indianStateSlice from "../Slices/stateSlices"
import notificationSlices from "../Slices/notificationSlices";
import costCentreSlices from "../Slices/costCentreSlices";
import ccBudgetSlices from "../Slices/ccBudgetSlices";
import dcaBudgetSlices from "../Slices/dcaBudgetSlices";
import reportSlices from "../Slices/reportsSlices";
import ledgerSlice from "../Slices/ledgerSlices";
import groupSlice from "../Slices/groupSlices";
import dashboardSlice from "../Slices/dashboardSlices"
import bankAccountSlice from "../Slices/bankAccountSlices"
import loanAccountSlice from "../Slices/loanAccountSlices"
import fixedDepositSlice from "../Slices/fixedDepositSlices"
import tdsAccountSlice from "../Slices/tdsAccountSlices"
import businessOppertunitySlice from "../Slices/businessOppertunitySlices"
import clientBoq from  "../Slices/clientBoqSlices"



const  store = configureStore({
    reducer: {
        userRoles : userRoleSlices,
        costCentreTypes:costCentreTypeSlices,
        users:usersSlices,
        auth:authSlices,
        userMenu:userMenuSlices,
        ccstate:indianStateSlice,
        notification:notificationSlices,
        costCentres:costCentreSlices,
        ccBudget: ccBudgetSlices,
        dcaBudget: dcaBudgetSlices,
        reports: reportSlices,
        ledger: ledgerSlice,
        group: groupSlice,
        dashboardPreference:dashboardSlice,
        bankAccount:bankAccountSlice,
        loan:loanAccountSlice,
        fixedDeposit:fixedDepositSlice,
        tds:tdsAccountSlice,
        businessOpportunity:businessOppertunitySlice,
        boq:clientBoq



    }
})


export default store