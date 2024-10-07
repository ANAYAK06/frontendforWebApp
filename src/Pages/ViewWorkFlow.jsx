import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { fetchUserRoles } from '../Slices/userRoleSlices';
import axios from 'axios';
import { FiEdit } from "react-icons/fi";
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices';






function ViewWorkFlow() {

  const [rowData, setRowData] = useState([])
  const userRoles = useSelector((state) => state.userRoles.userRoles);
  const costCentreTypes = useSelector((state) => state.costCentreTypes.costCentreTypes);

  const dispatch = useDispatch()


  useEffect(() => {
    dispatch(fetchUserRoles())
    dispatch(fetchCostCentreTypes())
  }, [dispatch])

  const getRoleName = useCallback((roleId) => {
    const role = userRoles.find(role => role.roleId === roleId)
    return role ? role.roleName : roleId
  }, [userRoles])

  const getCostCentreLabel = useCallback((costCentreTypevalue) => {
    const ccType = costCentreTypes.find(ccType => ccType.value === costCentreTypevalue)
    return ccType ? ccType.label : costCentreTypevalue
  }, [costCentreTypes])



  const fetchWorkFlowData = useCallback(async () => {
    try {
      const response = await axios.get('/api/permissions/rolepermissions')
      const data = response.data

      const formattedData = data.flatMap(workflow => {

        const isCostCentreApplicable = workflow.isCostCentreApplicable ?? false

        if (isCostCentreApplicable) {

          const groupedDetails = workflow.workflowDetails.reduce((acc, detail) => {
            const key = detail.costCentreType

            if (!acc[key]) acc[key] = []
            acc[key].push(detail)
            return acc


          }, {})
          return Object.entries(groupedDetails).map(([costCentreType, details], index) => ({
            workflowId: workflow.workflowId,
            workflowName: index === 0 ? workflow.workflowname : '',
            isCostCentreApplicable,
            costCentreType: getCostCentreLabel(parseInt(costCentreType)),
            roleDetails: details.map(detail => ({
              roleId: getRoleName(detail.roleId),
              approvalLimit: detail.approvalLimit !== null ? detail.approvalLimit : ' N/A',
              pathId: detail.pathId,
              levelId: detail.levelId
            })),
            rowSpan: Object.keys(groupedDetails).length,
            isFirstRow: index === 0
          }))
        } else {
          return [{
            workflowId: workflow.workflowId,
            workflowName: workflow.workflowname,
            isCostCentreApplicable,
            costCentreType: 'N/A',
            roleDetails: workflow.workflowDetails.map(detail => ({
              roleId: getRoleName(detail.roleId),
              approvalLimit: detail.approvalLimit !== null ? detail.approvalLimit : 'N/A',
              pathId: detail.pathId,
              levelId: detail.levelId

            })),
            rowSpan: 1,
            isFirstRow: true


          }]

        }


      })



      setRowData(formattedData)
    } catch (error) {
      console.error('Error fetching workflow data:', error);

    }
  }, [getRoleName, getCostCentreLabel]);

  const roleDetailsRenderer = useCallback((params) => {
    if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
      return ' No details avaliable'
    }
    return params.value.map(detail =>
      `Role: ${detail.roleId}, Approval Limit: ${detail.approvalLimit}, Level ID: ${detail.levelId}`
    ).join('\n');
  }, [])


  const workflowNameRenderer = useCallback((params) => {
    if (params.data.rowSpan > 1 && params.rowIndex % params.data.rowSpan === 0) {
      return {
        component: 'span',
        innerRenderer: () => params.value,
        rowSpan: params.data.rowSpan
      }
    }
    return params.value
  }, [])



  useEffect(() => {
    fetchWorkFlowData()
  }, [fetchWorkFlowData])


  const costCentreTypeRenderer = useCallback((params) => {
    return params.data.isCostCentreApplicable ? params.value : 'N/A'
  }, [])

  const handleEdit = (data) => {
    console.log('Edit', data)
  }

  const columnDefs = [
    { headerName: "Workflow ID", field: "workflowId", sortable: true, filter: true, width: 100 },
    {
      headerName: "Workflow Name",
      field: "workflowName",
      sortable: true,
      filter: true,
      width: 200,
      cellRenderer: workflowNameRenderer,
      cellClassRules: {
        'cell-span': params => params.data.rowSpan > 1 && params.data.isFirstRow
      }
    },
    {
      headerName: "Cost Centre Type",
      field: "costCentreType",
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: costCentreTypeRenderer
    },

    {
      headerName: "Role Details",
      field: "roleDetails",
      cellRenderer: roleDetailsRenderer,
      autoHeight: true,
      wrapText: true,
      width: 550,
      cellStyle: { 'white-space': 'pre-line' },
    },
    {
      headerName: "Actions",
      cellRenderer: params => <button onClick={() => handleEdit(params.data)}><FiEdit /></button>,
      sortable: false,
      filter: false,
      width: 100
    }


  ]




  return (
    <div>
      <div className="ag-theme-alpine mt-5" style={{
        height: 600, width: '100%',
        '--ag-header-background-color': '#3f03ad',
        '--ag-header-foreground-color': '#ffffff',
      }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSize={20}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows={true}
          suppressRowTransform = {true}
        />
      </div>
    </div>
  )
}

export default ViewWorkFlow
