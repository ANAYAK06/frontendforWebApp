import React ,{useEffect, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { MdDeleteForever, MdEditSquare } from 'react-icons/md';
import Success from '../Components/Success';
import ConfirmModal from '../Components/ConfirmModal';
import axios from 'axios';
import{
    fetchUserRoles,
    setSelectedRole,
    setEditRole,
    setEditRoleName,
    setSelectedCostCentreType,
    setRoleToDelete,
    updateUserRoles,
    deleteUserRole,
    setIsCostCentreChangeApplicable
    
} from '../Slices/userRoleSlices'
import {fetchCostCentreTypes} from '../Slices/costCentreTypeSlices'
import{fetchUsers} from '../Slices/usersSlices'


function Viewuserroles() {
  const dispatch = useDispatch()
  const [isConfirm, setIsConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)


  const userRoles = useSelector((state)=>state.userRoles.userRoles);
  const costCentreTypes = useSelector((state)=> state.costCentreTypes.costCentreTypes);
  const users = useSelector((state)=>state.users.users);
  const selectedRole = useSelector((state)=>state.userRoles.selectedRole)
  const editRole = useSelector((state)=>state.userRoles.editRole);
  const editRoleName = useSelector((state)=>state.userRoles.editRoleName)
  const selectedCostCentreType = useSelector((state)=>state.userRoles.selectedCostCentreType);
  const roleToDelete = useSelector((state)=>state.userRoles.roleToDelete);
  const isCostCentreChangeApplicable = useSelector((state)=>state.userRoles.isCostCentreChangeApplicable)


  useEffect(()=>{
    dispatch(fetchUserRoles());
    dispatch(fetchCostCentreTypes());
    dispatch(fetchUsers());
  },[dispatch]);

  useEffect(()=>{
    if(selectedRole){
      const fetchSelectedRole = async () =>{
        try {
          const response = await axios.get(`/api/roles/useroles/${selectedRole._id}`)
          const {roleName ,isCostCentreApplicable, costCentreTypes} = response.data
          dispatch(setEditRoleName(roleName))
          dispatch(setSelectedCostCentreType(costCentreTypes))
          dispatch(setIsCostCentreChangeApplicable(isCostCentreApplicable))
          
        } catch (error) {
          console.error('Error fetching selected role', error);
          
        }
      };
      fetchSelectedRole()
    }
  }, [selectedRole, dispatch])

  // map ccid to CCtype

  const mapCCToType = (ccidArray)  => {
    return ccidArray.map(ccid => {
        const ccType = costCentreTypes.find(cc => cc.value === ccid)?.label;
        return ccType
    })
}

const handleEditClick  = (role) =>{
  dispatch(setSelectedRole(role));
  dispatch(setEditRoleName(role.roleName));
  dispatch(setEditRole(true))
};

const handleUpdate = () => {
  dispatch(updateUserRoles({id:selectedRole._id, roleName:editRoleName, costCentreTypes:selectedCostCentreType,isCostCentreApplicable:isCostCentreChangeApplicable}))
  .then(()=>{
    dispatch(setEditRole(false));
    dispatch(setSelectedRole(null));
    dispatch(setEditRoleName(''));
    dispatch(setSelectedCostCentreType([]));
    dispatch(setIsCostCentreChangeApplicable(false))
    setIsSuccess(true)
    dispatch(fetchUserRoles())
    
  })
 


};

const allCostCentreOptions = costCentreTypes

const handleClose =()=>{
  setIsSuccess(false)
};

const isRoleAssignedToUser = (roleId) =>{
        
  return users.some(user => parseInt(user.roleId) === roleId)
};

const handleDeleteConfirm = (role) =>{
  dispatch(setRoleToDelete(role));
 setIsConfirm(true)

};

const handleDeleteRole = () =>{
  dispatch(deleteUserRole(roleToDelete._id))
  setIsConfirm(false)
  setIsSuccess(true)
}

 const handleCheckBoxChange = ()=>{
  dispatch(setIsCostCentreChangeApplicable(!isCostCentreChangeApplicable))
}
  return (
    <div className='mt-8'>
        <table className='min-w-full'>
            <thead className='bg-gray-200 text-gray-700'>
                <tr>
                    <th className=' border px-4 py-2'>Role Name</th>
                    <th className=' border px-4 py-2'>Cost Centre Applicable</th>
                    <th className=' border px-4 py-2'>Applicable Cost Centres</th>
                    
                    <th className=' border px-4 py-2'>Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    userRoles.map(role=> (
                        <tr key={role._id}>
                            <td className='border px-4 py-2 text-gray-700'>
                                {role.roleName}

                            </td>
                            <td className='border px-4 py-2 text-gray-700'>
                              {role.isCostCentreApplicable ? "Yes":"No"}
                            </td>
                            <td className='border px-4 py-2 text-gray-700'>

                                {mapCCToType(role.costCentreTypes, costCentreTypes).join(', ')}

                            </td>
                            <td className='border px-4 py-2'>
                                <button className='text-white bg-indigo-500 hover:bg-indigo-700 py-2 px-2 rounded-full mr-2'
                                onClick={()=>handleEditClick(role)}
                                ><MdEditSquare /></button>
                                <button
                                onClick={()=>handleDeleteConfirm(role)}
                                disabled={isRoleAssignedToUser(role.roleId)}
                                
                                 className={`text-white ${isRoleAssignedToUser(role.roleId) ? 'bg-gray-400 cursor-not-allowed':' bg-red-500 hover:bg-red-700'} py-2 px-2 rounded-full `}><MdDeleteForever /></button>
                            </td>

                        </tr>
                    ))
                }
            </tbody>

        </table>

        {/* Popup for Edit user roles   */ }
        {
            editRole && (

                <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10'>
                <div className='bg-white rounded-lg p-8 max-w-md w-full'>
                    <h2 className='text-lg font-semibold mb-4'>Edit Role</h2>
                    <div className='mb-4'>
                        <input type="text"
                        id='roleName'
                        className='mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        value={editRoleName}
                        onChange={(e)=> dispatch(setEditRoleName(e.target.value)) }
                        />
                         <label htmlFor="costCentreApplicable" className=' mt-2 block text-sm font-medium text-gray-700'>Cost Centre Applicable ?</label>
          <input type="checkbox"
           id='costCentreApplicable'
           className='w-4 h-4 cursor-pointer'
           checked={isCostCentreChangeApplicable}
           onChange={handleCheckBoxChange}

          
          />
          {
            isCostCentreChangeApplicable && (
              <Select className='mt-5'
              options={allCostCentreOptions}
              isMulti
              value={allCostCentreOptions.filter(option=>selectedCostCentreType.includes(option.value))}
              onChange={(selectedOptions)=>dispatch(setSelectedCostCentreType(selectedOptions.map(option =>option.value)))}

              />


            )
          }
                       
                    </div>
                    <div className='flex justify-end'>
                        <button className='mr-4  bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'
                        onClick={()=>dispatch(setEditRole(false))}
                        
                        >
                            Cancel
                        </button >
                        <button className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded'
                        onClick={handleUpdate}
                        >
                            Update
                        </button>
    
                    </div>
    
                </div>
    
            </div>

            )
        }
        {
            isConfirm && (

                <ConfirmModal
                onConfirm={handleDeleteRole}
                onCancel={()=>dispatch(setIsConfirm(false))}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${roleToDelete?.roleName}`}
                
                />

            )
        }
       
        {
            isSuccess && (
                <Success onClose={handleClose}/>
            )
        }

       

        
        
      
    </div>

  )
}

export default Viewuserroles
