import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { useDispatch, useSelector } from 'react-redux';
import {fetchUserRoles} from '../Slices/userRoleSlices'
import axios from 'axios';
import ViewUserCostCentre from './ViewUserCostCentre';


function UserCostCentre() {

  const dispatch = useDispatch()
  const userRoles = useSelector((state) => state.userRoles.userRoles);
  

  const [userOptons, setUserOptions] = useState([])
  const [costCentreOption, setCostCentreOptions] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCostCentre, setSelectedCostCentre] = useState(null)
 
  const [assignmentStatus, setAssignmentStatus] = useState(null)


  useEffect(()=>{
    dispatch(fetchUserRoles())
   
  }, [dispatch])


  useEffect(()=>{
    const fetchUserwithCostCentre = async()=>{
      try {
        const response = await axios.get('/api/userscostcentres/userwithcostcentre')
        const formatedOptions = response.data.map(user=>({
          value:user._id,
          label:user.userName,
          roleId:user.roleId,
          isCostCentreApplicable:true
        }))
        console.log('Formatted options:', formatedOptions);

        setUserOptions(formatedOptions)
        
      } catch (error) {
        console.error('Error fetching cost centre users:', error);
        
      }
    }
    fetchUserwithCostCentre()
  },[])

  const handleUserChange = async  (selectedOption)=>{
    setSelectedUser(selectedOption)
    if(selectedOption){
    try {
      const response = await axios.get(`/api/userscostcentres/getunassignedcostcentre/${selectedOption.value}`)
      
      const formattedOptions = response.data.map(cc=>({
        value: cc.ccNo,
        label:`${cc.ccNo}-${cc.ccName}`
      }))
      setCostCentreOptions(formattedOptions)
      console.log('Formatted options:', formattedOptions);
    } catch (error) {
      console.error('Error fetching unassigned cost centres:', error);
      setCostCentreOptions([]);
      
    }
  }else{
    setCostCentreOptions([])
  } 
  } 
             
   

const   getSelectedUserRoleName = ()=>{
    if(selectedUser){
      const userRole = userRoles.find(role => role.roleId === selectedUser.roleId)
      return userRole ? userRole.roleName : 'Unknown Role'
    }
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()
    if(!selectedUser || !selectedCostCentre || selectedCostCentre.length === 0){
      setAssignmentStatus('Please select both User and Cost Centres ')
      return
    }
    try {
        const payload = {
          userId: selectedUser.value,
          roleId: selectedUser.roleId,
          costCentreId:selectedCostCentre.map(cc=>cc.value)
        }
        console.log('Sending payload:', payload);
      const response = await axios.post('/api/userscostcentres/assigncostcentre', payload)
      setAssignmentStatus('Cost centre assigned successfully')
      console.log(response.data)
      setSelectedUser(null)
      setSelectedCostCentre(null)
      setCostCentreOptions([])
    } catch (error) {
      console.error('Error assigning cost centre:', error.response?.data || error.message);
        setAssignmentStatus('Error assigning cost centre. Please try again.');
    }
  }
  const handleCostCentreChange = (selectedOption) => {
    setSelectedCostCentre(selectedOption)
  }


  return (
      <>
    <div className='container mx-8 mt-10'>
      <h2  className='text-2xl font-semibold mb-4'>Assign Cost Centre to User</h2>
      <hr />
      <form action="" onSubmit={handleSubmit} className='mx-w-md mx-auto w-80'>
        <Select 
        className='mt-2'
        options={userOptons}
        placeholder = 'Select the User'
        onChange={handleUserChange}
        />
        {
          selectedUser && (
            <div>
              <p>User Role:{getSelectedUserRoleName()}</p>
              <Select
              className='mt-2'
              options={costCentreOption}
              placeholder='Select CC Codes'
              isMulti
              onChange={handleCostCentreChange}
              value={selectedCostCentre}
              />
            </div>
          )
        }
        <button type='submit' className='w-full mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700'>Submit</button>

      </form>

      <div>
      <ViewUserCostCentre/>
    </div>
    
    </div>
    
    </>
  )
}

export default UserCostCentre
