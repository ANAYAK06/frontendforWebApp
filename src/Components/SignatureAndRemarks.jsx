import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRoles } from '../Slices/userRoleSlices';




function SignatureAndRemarks({ signatures = [] }) {

  const dispatch = useDispatch()



  const userRoles = useSelector((state) => state.userRoles.userRoles);

  const getRoleName = useCallback((roleId) => {
    const role = userRoles.find(role => role.roleId === roleId)
    return role ? role.roleName : roleId
  }, [userRoles])


useEffect(()=>{
  if(!userRoles.length){
    dispatch(fetchUserRoles())
  }
 
}, [dispatch])


  return (
    <div className='mt-4'>
      <h4 className='text-lg font-medium text-gray-900'>Signatures and Remarks</h4>
      <div className='mt-2 overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Level</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Role Name</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>User Name</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Remarks</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {signatures.map((signature, index) => (
              <tr key={index}>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{signature.levelId}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{getRoleName(signature.roleId)}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{signature.userName}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{signature.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SignatureAndRemarks;