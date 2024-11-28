import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRoles } from '../Slices/userRoleSlices';

import { FaUserCircle  } from "react-icons/fa";
import { PiCheckCircleThin } from "react-icons/pi";




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
 
}, [dispatch, userRoles.length])


  return (
   
    <div className="bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-semibold text-gray-900">Signatures & Remarks</h4>
        <div className="text-sm text-gray-500">
          {signatures.length}Comment{signatures.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-6">
        {signatures.map((signature, index) => (
          <div key={index} className="relative">
            {/* Vertical Timeline Line */}
            {index !== signatures.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
            )}

            <div className="flex items-start gap-4">
              {/* User Avatar Section */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FaUserCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full">
                  <PiCheckCircleThin className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-indigo-500">{signature.userName}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{getRoleName(signature.roleId)}</span>
                        <span>•</span>
                        <span>{signature.levelId === 0? 'Creator':'Verifier'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {signature.createdAt ? new Date(signature.createdAt).toLocaleDateString() : 'Verified'}
                      </span>
                      <div className="mt-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {signature.levelId === 0? 'Initiated':'Verified'}
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {signature.remarks && (
                    <div className="mt-2 text-gray-600 text-sm p-3 bg-white rounded border border-gray-100">
                      {signature.remarks}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
  );
}

export default SignatureAndRemarks;