import {BrowserRouter, Route, Routes, Navigate} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import {loginUser, logout} from './Slices/authSlices'
import './App.css';
import Sidenav from './Components/Sidenav';
import Navbar from './Components/Navbar';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import Userroles from './Pages/Userroles'
import Users from './Pages/Users';
import AssignHierarchy from './Pages/AssignHierarchy';
import NewCC from './Pages/NewCC';
import Inbox from './Pages/Inbox';
import VerifyNewCC from './Pages/VerifyNewCC';
import UserCostCentre from './Pages/UserCostCentre'
import DCAcodes from './Pages/DCAcodes';
import AssignCCBudget from './Pages/AssignCCBudget';



import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AssignDCABudget from './Pages/AssignDCABudget';

import BalanceSheet from './Pages/Reports/BalanceSheet';
import LedgerCreation from './Pages/Accounts/LedgerCreation';
import VerifyLedger from './Pages/Accounts/VerifyLedger';
import ProfitAndLoss from './Pages/Reports/ProfitAndLoss';
import SubGroupCreation from './Pages/Accounts/SubGroupCreation';
import VerifyGroups from './Pages/Accounts/VerifyGroups';
import CCBudgetVerification from './Components/CCBudgetVerification';
import VerifyDcaBudget from './Pages/VerifyDcaBudget';
import BankCreation from './Pages/Accounts/BankCreation';
import VerifyBankAccount from './Pages/Accounts/VerifyBankAccount';
import LoanCreation from './Pages/Accounts/LoanCreation';
import VerifyLoan from './Pages/Accounts/VerifyLoan';
import FixedDepositCreation from './Pages/Accounts/FixedDepositCreation';
import VerifyFixedDeposit from './Pages/Accounts/VerifyFixedDeposit';
import TdsAccountCreation from './Pages/TaxModule/TdsAccountCreation';
import VerifyTdsAccount from './Pages/TaxModule/VerifyTdsAccount';
import BusinessOpportunityCreation from './Pages/Projects/BusinessOpportunityCreation';
import VerifyBusinessOppertunity from './Pages/Projects/VerifyBusinessOppertunity';
import BOQDraft from './Pages/Projects/BOQDraft';
import VerifyBOQ from './Pages/Projects/VerifyBOQ';
import BOQRevisionPage from './Pages/Projects/BOQRevisionPage';

function App() {

  const dispatch = useDispatch()
  const {isLoggedIn, userInfo} = useSelector((state)=>state.auth)

  

  const handleLogin = async(email, password)=>{
    dispatch(loginUser({email, password}))

  }

  const handleLogout =()=>{
    dispatch(logout())
  }



  return (
    <div className="App">
      <BrowserRouter>
      {isLoggedIn && <Navbar userName ={userInfo.userName} roleName={userInfo.roleName} onLogout ={handleLogout} isLoggedIn={isLoggedIn}/> }
      
      <div className='flex'>
        {isLoggedIn &&  <Sidenav/>}
        
        <Routes>

          <Route path='/' element={ isLoggedIn ? <Navigate to="/dashboard" />: <Login onLogin={handleLogin}  />} />

          <Route path='/dashboard' element={ isLoggedIn ?(<Dashboard/>): <Navigate to="/"/> }/>
          <Route path='/newroles' element ={ isLoggedIn ? (<Userroles/>):<Navigate to="/"/>} />
          <Route path='/usercreation' element ={ isLoggedIn ? (<Users/>):<Navigate to="/"/>} />
          <Route path='/assignhierarchy' element ={ isLoggedIn ? (<AssignHierarchy/>):<Navigate to="/"/>} />
          <Route path='/newcostcentre' element ={ isLoggedIn ? (<NewCC/>):<Navigate to="/"/>} />
          <Route path='/openinbox' element ={ isLoggedIn ? (<Inbox/>):<Navigate to="/"/>} />
          <Route path='/verifycostcentre' element ={ isLoggedIn ? (<VerifyNewCC/>):<Navigate to="/"/>} />
          <Route path='/assignusercostcentre' element ={ isLoggedIn ? (<UserCostCentre/>):<Navigate to="/"/>} />
          <Route path='/createnewdcacodes' element ={ isLoggedIn ? (<DCAcodes/>):<Navigate to="/"/>} />
          <Route path='/assignccbudget' element ={ isLoggedIn ? (<AssignCCBudget/>):<Navigate to="/"/>} />
          
          <Route path='/assigndcabudget' element ={ isLoggedIn ? (<AssignDCABudget/>):<Navigate to="/"/>} />
          <Route path='/verifydcabudget/:budgetType' element ={ isLoggedIn ? (<VerifyDcaBudget/>):<Navigate to="/"/>} />
          <Route path='/balance-sheet' element ={ isLoggedIn ? (<BalanceSheet/>):<Navigate to="/"/>} />
          <Route path='/create-ledger' element ={ isLoggedIn ? (<LedgerCreation/>):<Navigate to="/"/>} />
          <Route path='/verify-ledger' element ={ isLoggedIn ? (<VerifyLedger checkContent={false} />):<Navigate to="/"/>} />
          <Route path='/profit-and-loss' element ={ isLoggedIn ? (<ProfitAndLoss/>):<Navigate to="/"/>} />
          <Route path='/creategroups' element ={ isLoggedIn ? (<SubGroupCreation checkContent={false} />):<Navigate to="/"/>} />
          <Route path='/verify-group' element ={ isLoggedIn ? (<VerifyGroups/>):<Navigate to="/"/>} />
          <Route path='/verifyccbudget/:budgetType' element ={ isLoggedIn ? (<CCBudgetVerification/>):<Navigate to="/"/>} />
          <Route path='/createnewbankaccount' element ={ isLoggedIn ? (<BankCreation/>):<Navigate to="/"/>} />
          <Route path='/verify-new-bankaccount' element ={ isLoggedIn ? (<VerifyBankAccount/>):<Navigate to="/"/>} />
          <Route path='/create-new-loanaccount' element ={ isLoggedIn ? (<LoanCreation/>):<Navigate to="/"/>} />
          <Route path='/verify-new-loanaccount' element ={ isLoggedIn ? (<VerifyLoan/>):<Navigate to="/"/>} />
          <Route path='/create-fixed-deposit' element ={ isLoggedIn ? (<FixedDepositCreation/>):<Navigate to="/"/>} />
          <Route path='/verify-fixed-deposit' element ={ isLoggedIn ? (<VerifyFixedDeposit/>):<Navigate to="/"/>} />
          <Route path='/create-tds-account' element ={ isLoggedIn ? (<TdsAccountCreation/>):<Navigate to="/"/>} />
          <Route path='/verify-tds-account' element ={ isLoggedIn ? (<VerifyTdsAccount/>):<Navigate to="/"/>} />
          <Route path='/create-businessoppertunity' element ={ isLoggedIn ? (<BusinessOpportunityCreation/>):<Navigate to="/"/>} />
          <Route path='/verify-businessoppertunity' element ={ isLoggedIn ? (<VerifyBusinessOppertunity/>):<Navigate to="/"/>} />
          <Route path='/create-bid' element ={ isLoggedIn ? (<BOQDraft/>):<Navigate to="/"/>} />
          <Route path='/verify-bid' element ={ isLoggedIn ? (<VerifyBOQ/>):<Navigate to="/"/>} />
          <Route path='/boqrevision' element ={ isLoggedIn ? (<BOQRevisionPage/>):<Navigate to="/"/>} />
        
        
        </Routes>
        

      </div>
     
      </BrowserRouter>
      <ToastContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
       />
    
    </div>
  );
}

export default App;
