import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRoles } from '../Slices/userRoleSlices';
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices';
import { 
  fetchAllPermissionsThunk, 
  fetchPermissionByIdThunk,
  deletePermissionThunk 
} from '../Slices/permissionSlices';
import { 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiX, 
  FiRefreshCw, 
  FiChevronDown, 
  FiChevronRight,
  FiLayers,
  FiUsers
} from "react-icons/fi";
import { BiSolidLayerPlus } from "react-icons/bi";
import { GiPathDistance } from "react-icons/gi";
import { MdCurrencyRupee } from "react-icons/md";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../Components/DailogComponent';
import { showToast } from '../utilities/toastUtilities';

function ViewWorkFlow({ onEditWorkflow }) {
  const dispatch = useDispatch();
  const dataFetchedRef = useRef(false);
  
  // Redux state
  const workflows = useSelector((state) => state.permission?.workflows || []);
  const userRoles = useSelector((state) => state.userRoles?.userRoles || []);
  const costCentreTypes = useSelector((state) => state.costCentreTypes?.costCentreTypes || []);
  const loading = useSelector((state) => state.permission?.loading.fetchAll || false);
  const deleteLoading = useSelector((state) => state.permission?.loading.delete || false);
  
  // Local state
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  
  // Helper functions
  const getRoleName = useCallback((roleId) => {
    const role = userRoles.find(role => role.roleId === roleId);
    return role ? role.roleName : roleId;
  }, [userRoles]);

  const getCostCentreLabel = useCallback((costCentreTypeValue) => {
    const ccType = costCentreTypes.find(ccType => ccType.value === costCentreTypeValue);
    return ccType ? ccType.label : costCentreTypeValue;
  }, [costCentreTypes]);

  // Initial data loading
  useEffect(() => {
    if (!dataFetchedRef.current) {
      dispatch(fetchUserRoles());
      dispatch(fetchCostCentreTypes());
      dispatch(fetchAllPermissionsThunk());
      dataFetchedRef.current = true;
    }
  }, [dispatch]);

   // Filter data based on search term
   const filterData = useCallback((data = rowData) => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = data.filter(item => 
      item.workflowName.toLowerCase().includes(term) || 
      (item.variants && item.variants.some(variant => 
        variant.costCentreType.toString().toLowerCase().includes(term) ||
        variant.roleDetails.some(role => 
          role.roleId.toString().toLowerCase().includes(term)
        )
      ))
    );
    
    setFilteredData(filtered);
  }, [searchTerm, rowData]);


  // Process workflows data
  useEffect(() => {
    if (workflows && workflows.length > 0) {
      const formattedData = workflows.flatMap(workflow => {
        const isCostCentreApplicable = workflow.isCostCentreApplicable ?? false;

        if (isCostCentreApplicable) {
          const groupedDetails = workflow.workflowDetails.reduce((acc, detail) => {
            const key = detail.costCentreType;
            if (!acc[key]) acc[key] = [];
            acc[key].push(detail);
            return acc;
          }, {});
          
          return Object.entries(groupedDetails).map(([costCentreType, details], index) => ({
            id: `${workflow.workflowId}-${costCentreType}`,
            workflowId: workflow.workflowId,
            workflowName: workflow.workflowname,
            isCostCentreApplicable,
            costCentreType: getCostCentreLabel(parseInt(costCentreType)),
            costCentreTypeValue: parseInt(costCentreType),
            roleDetails: details.map(detail => ({
              roleId: getRoleName(detail.roleId),
              roleIdValue: detail.roleId,
              approvalLimit: detail.approvalLimit !== null ? detail.approvalLimit : 'N/A',
              pathId: detail.pathId,
              levelId: detail.levelId
            })),
            groupIndex: index,
            totalGroups: Object.keys(groupedDetails).length
          }));
        } else {
          return [{
            id: workflow.workflowId.toString(),
            workflowId: workflow.workflowId,
            workflowName: workflow.workflowname,
            isCostCentreApplicable,
            costCentreType: 'N/A',
            roleDetails: workflow.workflowDetails.map(detail => ({
              roleId: getRoleName(detail.roleId),
              roleIdValue: detail.roleId,
              approvalLimit: detail.approvalLimit !== null ? detail.approvalLimit : 'N/A',
              pathId: detail.pathId,
              levelId: detail.levelId
            })),
            groupIndex: 0,
            totalGroups: 1
          }];
        }
      });

      // Group by workflowId for display
      const groupedByWorkflow = formattedData.reduce((acc, item) => {
        if (!acc[item.workflowId]) {
          acc[item.workflowId] = {
            workflowId: item.workflowId,
            workflowName: item.workflowName,
            isCostCentreApplicable: item.isCostCentreApplicable,
            variants: []
          };
        }
        acc[item.workflowId].variants.push({
          id: item.id,
          costCentreType: item.costCentreType,
          costCentreTypeValue: item.costCentreTypeValue,
          roleDetails: item.roleDetails
        });
        return acc;
      }, {});

      const processedData = Object.values(groupedByWorkflow);
      setRowData(processedData);
      filterData(processedData);
    } else {
      setRowData([]);
      setFilteredData([]);
    }
  }, [workflows, getRoleName, getCostCentreLabel]);

 
  // Apply search filter when search term changes
  useEffect(() => {
    filterData();
  }, [searchTerm, filterData]);

  // Toggle row expansion
  const toggleRowExpand = (workflowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [workflowId]: !prev[workflowId]
    }));
  };

  // Handle edit click
  const handleEditClick = async (workflow) => {
    try {
      // Get the complete workflow data for editing
      await dispatch(fetchPermissionByIdThunk(workflow.workflowId));
      const fullWorkflow = workflows.find(wf => wf.workflowId === workflow.workflowId);
      if (fullWorkflow && onEditWorkflow) {
        onEditWorkflow(fullWorkflow);
      }
    } catch (error) {
      console.error('Error fetching workflow for edit:', error);
      showToast('error', 'Failed to load workflow details for editing');
    }
  };

  // Handle delete click
  const handleDeleteClick = (workflow) => {
    setSelectedItem(workflow);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedItem) {
      dispatch(deletePermissionThunk(selectedItem.workflowId))
        .unwrap()
        .then(() => {
          showToast('success', 'Workflow deleted successfully');
          setDeleteDialogOpen(false);
        })
        .catch((error) => {
          showToast('error', error?.error || 'Error deleting workflow');
        });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Manually refresh data
  const handleRefresh = () => {
    dispatch(fetchAllPermissionsThunk());
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by workflow, role, or cost centre"
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-10 py-2 border rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-3 flex items-center"
              aria-label="Clear search"
            >
              <FiX className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
            {filteredData.length} {filteredData.length === 1 ? 'Workflow' : 'Workflows'}
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
          >
            <FiRefreshCw className="mr-1" /> Refresh
          </button>
        </div>
      </div>
      
      {filteredData.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          {searchTerm ? (
            <>
              <p className="text-gray-500 mb-2">No workflows match your search criteria.</p>
              <button
                onClick={handleClearSearch}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Clear search
              </button>
            </>
          ) : (
            <p className="text-gray-500">No workflows found.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workflow Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Centre Applicable
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((workflow) => (
                <React.Fragment key={workflow.workflowId}>
                  <tr 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      expandedRows[workflow.workflowId] ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => toggleRowExpand(workflow.workflowId)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{workflow.workflowId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {expandedRows[workflow.workflowId] ? 
                          <FiChevronDown className="text-indigo-500 mr-2" /> : 
                          <FiChevronRight className="text-gray-400 mr-2" />
                        }
                        <span className="font-medium text-gray-900">{workflow.workflowName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.isCostCentreApplicable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.isCostCentreApplicable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleEditClick(workflow)}
                          className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit workflow"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(workflow)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete workflow"
                          disabled={deleteLoading}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded row details */}
                  {expandedRows[workflow.workflowId] && (
                    <tr>
                      <td colSpan="4" className="py-0">
                        <div className="border-t border-gray-100 bg-gray-50 p-4">
                          {workflow.variants.map((variant, index) => (
                            <div 
                              key={variant.id} 
                              className={index !== workflow.variants.length - 1 ? "mb-4 pb-4 border-b border-gray-200" : ""}
                            >
                              {workflow.isCostCentreApplicable && (
                                <div className="flex items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700 bg-indigo-100 px-2 py-1 rounded-md flex items-center">
                                    <FiLayers className="mr-1 text-indigo-500" /> 
                                    Cost Centre Type: {variant.costCentreType}
                                  </span>
                                </div>
                              )}
                              
                              <div className="overflow-x-auto mt-2">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md bg-white">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Level
                                      </th>
                                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                      </th>
                                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Path ID
                                      </th>
                                      <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Approval Limit
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {variant.roleDetails
                                      .sort((a, b) => a.levelId - b.levelId)
                                      .map((role, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="py-2 px-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                              {role.levelId === 0 ? (
                                                <BiSolidLayerPlus className="text-blue-500 mr-1" />
                                              ) : (
                                                <FiUsers className="text-green-500 mr-1" />
                                              )}
                                              <span className="text-sm font-medium text-gray-900">
                                                {role.levelId === 0 
                                                  ? "Creator Level -1" 
                                                  : `Verifier Level ${role.levelId}`}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="py-2 px-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-700">{role.roleId}</span>
                                          </td>
                                          <td className="py-2 px-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                              <GiPathDistance className="text-indigo-500 mr-1" />
                                              <span className="text-sm text-gray-700">{role.pathId}</span>
                                            </div>
                                          </td>
                                          <td className="py-2 px-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                              {role.approvalLimit !== 'N/A' ? (
                                                <>
                                                  <span className="text-sm text-gray-700 bg-green-50 px-2 py-0.5 rounded-md flex items-center">
                                                   <MdCurrencyRupee className="text-green-500 mr-1" />
                                                    {role.approvalLimit}
                                                  </span>
                                                </>
                                              ) : (
                                                <span className="text-sm text-gray-500">N/A</span>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the workflow <span className="font-medium">{selectedItem?.workflowName}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ViewWorkFlow;