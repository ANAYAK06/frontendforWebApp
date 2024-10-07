import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import Viewusers from './Viewusers'
import ConfirmModal from '../Components/ConfirmModal'
import Success from '../Components/Success'
import {fetchUserRoles} from '../Slices/userRoleSlices'
import { useDispatch, useSelector } from 'react-redux'
import { createUser, fetchUsers } from '../Slices/usersSlices'
import ErrorConfirm from '../Components/ErrorConfirm'





function Users({roleName}) {

  const dispatch = useDispatch()

  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [isConfirm , setIsConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const userRoles = useSelector((state)=>state.userRoles.userRoles)

 

  const handleUserName = (e)=>{
    setUserName(e.target.value)
  }
  const handleEmail =(e)=>{
    setEmail(e.target.value)
  }

  useEffect(()=>{
    dispatch(fetchUserRoles())
  },[dispatch])

  useEffect(()=>{
    if(isSuccess){
      dispatch(fetchUsers())
      setIsSuccess(false)
    }
  },[dispatch, isSuccess])

  const handleRoleChange = (selectedOption)=> {
    setSelectedRole(selectedOption)
  }

  const handleConfirm = async (e)=>{
    e.preventDefault()
    setIsConfirm(true)
  }

 



  const handleUserRegistration = async(e)=>{
    e.preventDefault();

    try {

      const roleId = selectedRole ? selectedRole.value :null
      const payload = {userName, email, roleId}
      console.log(payload)
      
      const response =  await dispatch(createUser(payload)).unwrap()
      if(response.error){
        setError(response.error)
        setIsConfirm(false)
      } else{
        setIsSuccess(true)
        setIsConfirm(false)
        setError('')
        setUserName('')
        setEmail('')
        setSelectedRole(null)
       

      }     
    } catch (error) {
      console.error('Error occured while creating user front', error.message)
      setIsConfirm(false)
      setError(error)
      
    }
    

  }

  const handleClose = ()=>{
    try {

        setIsConfirm(false)
        setIsSuccess(false)
        setEmail('')
        setUserName('')
        setSelectedRole([])
        setError('')

      
    } catch (error) {
      
    }
  }

  const options = userRoles.map(role=>({
    value:role.roleId,
    label:role.roleName
  }))



  return (
    <div className='mt-10 mx-10 container'>
        <h2 className='text-gray-800 font-semibold' >User Registration</h2>
        <hr />
        
            <form action="" onSubmit={handleConfirm} className=' mx-auto w-80'>
                <div className='mb-4'>
                <label htmlFor="userName" className='mx-2'>User Name</label>
                <input type="text" className='mt-1 p-2 w-full mx-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' placeholder='Username'
                id='userName'
                value={userName}
                required
                onChange={handleUserName} />
                <label htmlFor="email" className='mx-2'>Email </label>
                <input type="email"
                id='email'
                value={email}
                required
                onChange={handleEmail} 
                 className='mt-1 p-2 w-full mx-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500' placeholder='Email'/>


                </div>
                <Select
                className='mx-2 w-full'
                value={selectedRole}
                onChange={handleRoleChange}
                options={options}
                placeholder="Select Role"
                >
               
                 

          
                </Select>
               
                <button type='submit' className=' w-full mx-2 bg-indigo-600 text-white mt-2 py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700'>Register User</button>
                
                
            </form>
            {
              isConfirm && (
                <ConfirmModal
                title="Confirm user Registration"
                message={`Are you want to register ${userName} as a user ? `}
                onConfirm={handleUserRegistration}
                onCancel={handleClose}
                />
              )
            }
            {
              isSuccess && (
                <Success
                onClose={handleClose}
                  />
              )
            }
            {
              error && (
                <ErrorConfirm
                title='Error Occurred while registering this user '
                onCancel={handleClose}
                message='User already existing'
                />
              )
            }
        
        <div>
            <Viewusers roleName={roleName} />

        </div>
        
    </div>
  )
}

export default Users
