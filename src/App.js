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
import VerifyPerformingCCBudget from './Pages/VerifyPerformingCCBudget';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerifyNPCCBudget from './Pages/VerifyNPCCBudget';
import AssignDCABudget from './Pages/AssignDCABudget';
import VerifyPCCDcaBudget from './Pages/VerifyPCCDcaBudget';

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
          <Route path='/verifyccbudget-performing' element ={ isLoggedIn ? (<VerifyPerformingCCBudget/>):<Navigate to="/"/>} />
          <Route path='/verifyccbudget-nonperforming' element ={ isLoggedIn ? (<VerifyNPCCBudget/>):<Navigate to="/"/>} />
          <Route path='/assigndcabudget' element ={ isLoggedIn ? (<AssignDCABudget/>):<Navigate to="/"/>} />
          <Route path='/verifydcabudget-performing' element ={ isLoggedIn ? (<VerifyPCCDcaBudget/>):<Navigate to="/"/>} />
        
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
