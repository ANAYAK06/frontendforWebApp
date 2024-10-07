import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Select from 'react-select'
import ConfirmModal from '../Components/ConfirmModal'
import Success from '../Components/Success'
import  Viewuserroles from './Viewuserroles'
import {
  setRoleName,
  setSelectedCostCentreType,
  createUserRole,
  setIsCostCentreApplicable
  

} from '../Slices/userRoleSlices'
import { fetchCostCentreTypes} from '../Slices/costCentreTypeSlices'
import ErrorConfirm from '../Components/ErrorConfirm'






function Userroles() {
  const dispatch  = useDispatch()
  const [error, setError] = useState('')
  const [isConfirm, setIsConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const roleName = useSelector((state)=>state.userRoles.roleName)
  const costCentreTypes = useSelector((state)=>state.costCentreTypes.costCentreTypes)
  const isCostCentreApplicable = useSelector((state)=>state.userRoles.isCostCentreApplicable)
  const selectedCostCentreType = useSelector((state)=>state.userRoles.selectedCostCentreType)
 






  useEffect(()=>{

  dispatch(fetchCostCentreTypes())


  },[dispatch])

  const handleRoleNameChange = (e)=>{
    dispatch(setRoleName(e.target.value))
  }

  const handleCostCentreApplicableChange = (e)=>{
    const isChecked = e.target.checked
    console.log('Cost Centre applicable changed to is Checked' , isChecked)
    dispatch(setIsCostCentreApplicable(isChecked))
  }

  const handleCCselection =(selectdCCType)=>{
    console.log('Selected Cost Centre Types ', selectdCCType)
    dispatch(setSelectedCostCentreType(selectdCCType))
  }

  const handleSubmit = async (e) =>{
    e.preventDefault();
    setIsConfirm(true)
   
  }

  const handleConfirm  = async (confirmed) =>{

    setIsConfirm(false)

    if(!confirmed) {
      return
    }
    
    try {

      const ccid = selectedCostCentreType.map((item)=>item.value);
      

      const payload = {roleName, isCostCentreApplicable, ccid};
      
      const response = await dispatch(createUserRole(payload)).unwrap();
      if(response.error){
        setError(response.error

        )
      } else {
        setIsSuccess(true)
        setError('')

      }
       } catch (error) {

      console.error('Error occured while creating role', error.message)
      setError(error.message)
      
    }

  }

  const handleClose = ()=>{
   setIsConfirm(false)
   setIsSuccess(false)
   dispatch(setRoleName(''))
   dispatch(setSelectedCostCentreType([]))
   dispatch(setIsCostCentreApplicable(false))
   setError('')
  }



  return (
    <div className='container mt-10 mx-8'>
      <h2 className='text-2xl font-semibold mb-4'>User Roles</h2>
      
      <form action="" onSubmit={handleSubmit} className='mx-w-md mx-auto w-80'>
        <div className="mb-4">
          <label htmlFor="roleName" className='block text-sm font-medium text-gray-700'>Role Name</label>
          <input type="text"
          id='roleName'
          className='mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
          value={roleName}
          required
          onChange={handleRoleNameChange}
          
          />
         {error && (<ErrorConfirm
         message='Duplicate Role Found'
         onCancel={handleClose}
         title='Error Occurred '
         />)}
        </div>
        <div className='mb-4'>
          <label htmlFor="costCentreApplicable" className='block text-sm font-medium text-gray-700'>Cost Centre Applicable ?</label>
          <input type="checkbox"
           id='costCentreApplicable'
           checked ={isCostCentreApplicable}
           onChange={handleCostCentreApplicableChange}
          />

        </div>
        {
          isCostCentreApplicable && (
            <Select
            value={selectedCostCentreType}
            onChange={handleCCselection}
            options={costCentreTypes}
            isMulti
            placeholder="Select Cost Centre Types"
            required
            >
              {
                selectedCostCentreType.length >0 && (
                  <div>
                    Selected Options:
                    <ul>
                      {
                        selectedCostCentreType.map(option=>(
                          <li key={option.value}>{option.label}(value:{option.value})
      
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )
              }
      
            </Select>

          )
        }
     

      <div className='mt-4'>
        <button type='submit' className='w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700'>Create Role</button>
      </div>


      </form>

      {
        isConfirm && (
          <ConfirmModal
          title="Confirm Action"
          message="Do you want to create this Role?"
          onConfirm={handleConfirm}
          onCancel={handleClose}
          
          />

        )
      }
      {
        isSuccess && (

          <Success onClose={handleClose}/>

        )
      }

      
    
      
   

      <div>
        
      </div>

      <Viewuserroles/>

      
    </div>
  )
}

export default Userroles
