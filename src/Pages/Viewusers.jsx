
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Success from '../Components/Success';

import {fetchUsers,updateUser, toggleUserStatus, deleteUser} from '../Slices/usersSlices'
import {fetchUserRoles} from '../Slices/userRoleSlices'
import { useDispatch, useSelector } from 'react-redux';
import ConfirmModal from '../Components/ConfirmModal';


function Viewusers() {

  const dispatch = useDispatch()


  const [selectedUser, setSelectedUser] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [editUserName, setEditUserName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editSelectedRole, setEditSelectedRole] =useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isStatusChange, setIsStatusChange] = useState(false)
  const [deleteUserConfirm, setDeleteUserConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const userRoles = useSelector((state)=>state.userRoles.userRoles);
  const users = useSelector((state)=>state.users.users);
  



  useEffect(()=>{
    dispatch(fetchUsers())
    dispatch(fetchUserRoles())
  },[dispatch])

useEffect(()=>{
  if(isStatusChange || isSuccess){
    dispatch(fetchUsers())
  }
},[dispatch, isStatusChange, isSuccess])


 const handleEditUser = (user)=>{
  setSelectedUser(user)
  setEditUserName(user.userName)
  setEditEmail(user.email)
  setEditSelectedRole(user.roleId)
  setEditUser(true)

 }

 const handleUpdateUser = async()=>{
  try {
    await dispatch(updateUser({
      _id: selectedUser._id,
      userName:editUserName,
      email:editEmail,
      roleId:editSelectedRole

    })).unwrap()
    setEditUserName('')
    setEditEmail('')
    setEditSelectedRole(null)
    setSelectedUser(null)
    setEditUser(false)
    setIsSuccess(true)
    
  } catch (error) {
    console.error('error occurred while updating user', error);
    
  }

  
 }


 const toggleStatus = async(userId) =>{
  try {

    await dispatch(toggleUserStatus(userId)).unwrap()
    setIsStatusChange(true)
    
  } catch (error) {

    console.error('Error while toggling user status',error)
    
  }


 }
 const options = userRoles.map(role=>({
  value:role.roleId,
  label:role.roleName
}))

const handleDeleteConfirm =(user)=>{
  setUserToDelete(user)
  setDeleteUserConfirm(true)
}

const onClose = ()=>{
  setDeleteUserConfirm(false)
}

const removeUser = ()=>{
  dispatch(deleteUser(userToDelete._id))
  setDeleteUserConfirm(false)
  setIsSuccess(true)
}





  return (
    <div className='mt-8'>
      <table className=' min-w-full'>
        <thead>
          <tr>
            <th className='border px-2, py-2'>User name</th>
            <th className='border px-2, py-2'>Email</th>
            <th className='border px-2, py-2'>Role</th>
            <th className='border px-2, py-2'>Status</th>
            <th className='border px-2, py-2'>Actions</th>

          </tr>
        </thead>
        <tbody className='items-center text-center'>
          {
            users.map(user=>(
              <tr key={user._id}>
              <td className='border px-4 py-2 text-gray-700'>{user.userName}</td>
              <td className='border px-4 py-2 text-gray-700'>{user.email}</td>
              <td className='border px-4 py-2 text-gray-700'>{userRoles.find(role=>role.roleId === user.roleId)?.roleName}</td>
              <td className='border'>
              <button onClick={()=>toggleStatus(user._id)}>{user.status === 1 ? <MdToggleOn className='text-green-600  text-4xl inline-flex'/> :<MdToggleOff className='text-red-600 text-4xl inline-flex'/>}</button>

              </td>
              <td className='border px-4 py-2 text-gray-700'>

                <button className='px-2 py-2 rounded-full bg-yellow-400 inline-block items-center hover:bg-yellow-600' onClick={()=>handleEditUser(user)} ><FaRegEdit /></button>
                <button  className={`px-2 py-2 mx-2 rounded-full ${user.status ===1 ?'bg-gray-400 cursor-not-allowed':' bg-red-500 inline-block items-center text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                 onClick={()=>handleDeleteConfirm(user)}
                 disabled ={user.status ===1}
                >
                  
                  <MdDeleteForever /></button>
                  

                  

              
               
              </td>
            </tr>

            ))
          }
         
        </tbody>

      </table>
      {
        isStatusChange && (
       <Success onClose={()=>setIsStatusChange(false)} />
        )
      }

      {/* Popup for user Edit*/}

      {
        editUser && (
          
      <div className ='fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10'>
      <div className ='bg-white rounded-lg p-8 max-w-md w-full'>
        <h2 className ='text-lg font-semibold mb-4'>Edit User</h2>
        <div className='mb-4'>
          <input type="text"
          id='userName'
          className='mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
          value={editUserName}
          onChange ={(e)=>setEditUserName(e.target.value)}
           />
            <input type="email"
          id='email'
          className='mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
          value={editEmail}
          onChange ={(e)=>setEditEmail(e.target.value)}
           />

          <Select className='mt-2'
            options={options}
            value={options.find(option=> option.value === editSelectedRole)}
            onChange={(selectedOptions)=>setEditSelectedRole(selectedOptions.value)}

          
          />
           

          <div className='flex justify-end mt-2'>
            <button onClick={()=>setEditUser(false)}
            className='mr-4  bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'
            >
              Cancel
            </button>
            <button
            className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded'
            onClick={handleUpdateUser}
            >
              Update
            </button>

          </div>

        </div>

      </div>

    </div>
  
          
        )
      }
      {
        isSuccess && (
          <Success onClose={()=>setIsSuccess(false)} />
        )
      }
      {
        deleteUserConfirm && (
          <ConfirmModal
          onCancel={onClose}
          title='Delete User'
          onConfirm={removeUser}
          message={(<span>Do you Want to remove the User <span className='text-red-600 font-semibold'>{userToDelete.userName}</span>? </span>)}
          />
        )
      }

      
    </div>
  )
}

export default Viewusers
