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
        dashboardPreference:dashboardSlice



    }
})


export default store