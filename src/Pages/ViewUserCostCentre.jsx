import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRoles } from '../Slices/userRoleSlices';
import { fetchUsers } from '../Slices/usersSlices';
import { fetchAllCCdata } from '../Slices/costCentreSlices';
import { FiEdit } from "react-icons/fi";





function ViewUserCostCentre() {

    const dispatch = useDispatch()

    const [loading , setLoading]= useState(true)
    const [userCC, setUserCC] = useState([])
    const [error, setError] = useState(null);
    const userRoles = useSelector((state)=>state.userRoles.userRoles);
    const users = useSelector((state)=>state.users.users);
    const ccData = useSelector((state)=>state.costCentres.costCentres)


const [columnDefs]= useState([
    {headerName: "User Name", field:"userName", sortable:true, filter:true},
    {headerName: "Role Name", field:"roleName", sortable:true, filter:true},
    {headerName: "User Cost Centre", field:"costCentres", sortable:true, filter:true},
    {
        headerName:"Actions",
        cellRenderer:params=><button onClick={()=>handleEdit(params.data)}><FiEdit /></button>
    }
])
 
const getUserName = useCallback((userId)=>{
    const user = users.find(user=>user._id === userId)
    return user ? user.userName :userId
},[users])

const getRoleName = useCallback((roleId)=>{
    const role = userRoles.find(role=>role.roleId === roleId)
    return role? role.roleName: roleId
},[userRoles])

    
const fetchUserassignedCostcentres = useCallback( async()=>{
    try {
        const response = await axios.get('/api/userscostcentres/viewuserassignedcostcentres')
        const processedData = response.data.map(assignment => ({
            ...assignment,
            userName:getUserName(assignment.userId),
            roleName:getRoleName(assignment.roleId),
            costCentres: Array.isArray(assignment.costCentreId)
            ? assignment.costCentreId.join(','):
            assignment.costCentreId
        }))
        setUserCC(processedData)
    } catch (error) {
        console.error('Error fetching assignments:', error);
        setError('Failed to fetch assignments');
    }finally{
        setLoading(false)
    }
},[getUserName, getRoleName])

useEffect(()=>{
    setLoading(true)
    Promise.all([
        dispatch(fetchUsers()),
        dispatch(fetchUserRoles())
    ]).catch(error=>{
        console.error('Error fetching users or roles:', error);
        setError('Failed to fetch users or roles');
    }).finally(()=>setLoading(false))
    
}, [dispatch])

useEffect(()=>{
    fetchUserassignedCostcentres()
},[fetchUserassignedCostcentres])





const handleEdit = (data)=>{
    console.log('Edit', data)
}

if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>

  return (
    <div className='container mt-5 items-center flex justify-center'>
     <div className='ag-theme-alpine' style={{height:400, width:'70%'}}>
        <AgGridReact
        rowData={userCC}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        />

     </div>
    </div>
  )
}

export default ViewUserCostCentre
