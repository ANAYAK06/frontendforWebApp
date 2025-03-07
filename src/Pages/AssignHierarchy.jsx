import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Select from 'react-select';
import { 
  IoIosAddCircle,
  IoMdCheckmarkCircle 
} from "react-icons/io";
import { 
  TiDelete 
} from "react-icons/ti";
import { 
  FiPlus,
  FiSave,
  FiX,
  FiLayers,
  FiUsers,
  FiSettings
} from "react-icons/fi";
import { 
  GiPathDistance 
} from "react-icons/gi";
import { BiSolidLayerPlus } from "react-icons/bi";

// Import Redux actions
import { fetchUserRoles } from '../Slices/userRoleSlices';
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices';
import { 
  fetchAllPermissionsThunk, 
  createPermissionThunk 
} from '../Slices/permissionSlices';

// Import components
import ViewWorkFlow from './ViewWorkFlow';
import HierarchyTabs from '../Components/HierarchyTabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../Components/Card';
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

function AssignHierarchy() {
  const dispatch = useDispatch();
  const dataFetchedRef = useRef(false);
  
  // Redux state
  const userRoles = useSelector((state) => state.userRoles?.userRoles || []);
  const costCentreTypes = useSelector((state) => state.costCentreTypes?.costCentreTypes || []);
  const workflows = useSelector((state) => state.permission?.workflows || []);
  const loading = useSelector((state) => state.permission?.loading.add || false);
  
  // Local state for menu data
  const [menuWholeData, setMenuWholeData] = useState([]);
  
  // Local state for hierarchy setup
  const [isCostCentreApplicable, setIsCostCentreApplicable] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hierarchyPopup, setHierarchyPopup] = useState(false);
  const [rolesByTab, setRolesByTab] = useState({});
  const [tempSaveData, setTempSaveData] = useState({});
  const [saveTabs, setSaveTabs] = useState({});
  
  // State for workflow selection
  const [workflowGroups, setWorkflowGroups] = useState([]);
  const [selectedWorkflowGroup, setSelectedWorkflowGroup] = useState(null);
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [existingWorkflows, setExistingWorkflows] = useState([]);
  
  // State for feedback
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Initial data loading
  useEffect(() => {
    if (!dataFetchedRef.current) {
      dispatch(fetchUserRoles());
      dispatch(fetchCostCentreTypes());
      dispatch(fetchAllPermissionsThunk());
      
      // Fetch menu data (using axios directly as in your original code)
      const fetchMenuData = async () => {
        try {
          const response = await axios.get('/api/usermenudata/getusermenu');
          setMenuWholeData(response.data);
          extractGroups(response.data);
        } catch (error) {
          console.error('Error fetching menuData:', error);
          showToast('error', 'Failed to load workflow groups');
        }
      };
      
      fetchMenuData();
      dataFetchedRef.current = true;
    }
  }, [dispatch]);

  // Extract existing workflow IDs from loaded workflows
  useEffect(() => {
    if (workflows && workflows.length > 0) {
      const existingIds = workflows.map(wf => wf.workflowId);
      setExistingWorkflows(existingIds);
    }
  }, [workflows]);

  // Extract workflow groups from menu data
  const extractGroups = (data) => {
    const groupSet = new Map();
    data.forEach(menu => {
      if (menu.submenuItems) {
        menu.submenuItems.forEach(submenuItem => {
          groupSet.set(submenuItem.groupId, submenuItem.group);
        });
      }
    });

    const workflowGroupOptions = Array.from(groupSet.entries()).map(([groupId, group]) => ({
      value: groupId,
      label: group
    }));

    setWorkflowGroups(workflowGroupOptions);
  };

  // Initialize roles for each tab
  const initializeRolesByTab = useCallback(() => {
    setRolesByTab(prevRoles => {
      const newRoles = {};
      costCentreTypes.forEach((costCentreType, index) => {
        newRoles[index] = [{
          roleId: null,
          approvalLimit: '',
          levelId: 0,
          pathId: 0,
          costCentreType: costCentreType.value
        }];
      });
      return newRoles;
    });
  }, [costCentreTypes]);

  // Get verification path ID based on cost center type
  const getVerificationPathId = useCallback((ccid) => {
    if (isCostCentreApplicable) {
      switch (ccid) {
        case 100: return 2;
        case 101: return 3;
        case 102: return 4;
        default: return 1;
      }
    }
    return 1;
  }, [isCostCentreApplicable]);

  // Handle role selection change
  const handleRoleChange = useCallback((tabIndex, roleIndex, selectedRole) => {
    setRolesByTab(prevRoles => {
      const updatedTabRoles = [...(prevRoles[tabIndex] || [])];
      updatedTabRoles[roleIndex] = {
        ...updatedTabRoles[roleIndex],
        roleId: selectedRole ? selectedRole.value : null
      };
      return { ...prevRoles, [tabIndex]: updatedTabRoles };
    });
  }, []);

  // Add a new role row
  const addNewLine = useCallback((tabIndex) => {
    setRolesByTab(prevRoles => {
      const currentTabRoles = prevRoles[tabIndex] || [];
      const newIndex = currentTabRoles.length;
      const ccid = isCostCentreApplicable ? costCentreTypes[tabIndex]?.value : null;
      return {
        ...prevRoles,
        [tabIndex]: [
          ...currentTabRoles,
          {
            roleId: null,
            approvalLimit: '',
            levelId: newIndex,
            pathId: newIndex === 0 ? 0 : (isCostCentreApplicable ? getVerificationPathId(ccid) : 1),
            costCentreType: ccid
          }
        ]
      };
    });
  }, [getVerificationPathId, costCentreTypes, isCostCentreApplicable]);

  // Delete a role row
  const deleteRow = useCallback((tabIndex, roleIndex) => {
    setRolesByTab(prevRoles => {
      const updatedTabRoles = [...(prevRoles[tabIndex] || [])];
      updatedTabRoles.splice(roleIndex, 1);
      // Recalculate levelId to maintain sequence
      updatedTabRoles.forEach((role, idx) => {
        role.levelId = idx;
        if (idx > 0) {
          role.pathId = isCostCentreApplicable ? 
            getVerificationPathId(role.costCentreType) : 
            1;
        }
      });
      return { ...prevRoles, [tabIndex]: updatedTabRoles };
    });
  }, [getVerificationPathId, isCostCentreApplicable]);

  // Temporarily save the current tab's data
  const tempSave = useCallback((tabIndex) => {
    const currentTabRoles = rolesByTab[tabIndex] || [];
    
    // Validate that all roles in the tab are selected
    const hasUnselectedRole = currentTabRoles.some(role => role.roleId === null);
    if (hasUnselectedRole) {
      showToast('error', 'All roles must be selected before saving');
      return;
    }
    
    const ccid = isCostCentreApplicable ? costCentreTypes[tabIndex]?.value : null;
    const updatedRoles = currentTabRoles.map((role, index) => {
      const pathId = index === 0 ? 0 : getVerificationPathId(ccid);
      return {
        ...role,
        pathId,
        levelId: index,
        costCentreType: ccid
      };
    });

    setTempSaveData(prevData => ({
      ...prevData,
      [tabIndex]: {
        roles: updatedRoles,
      }
    }));

    setRolesByTab(prevRoles => ({
      ...prevRoles,
      [tabIndex]: updatedRoles
    }));
    
    setSaveTabs(prevSavedTabs => ({
      ...prevSavedTabs,
      [tabIndex]: true
    }));

    const message = isCostCentreApplicable
      ? `Workflow saved for ${costCentreTypes[tabIndex].label}`
      : 'Workflow saved successfully';

    showToast('success', message);
  }, [rolesByTab, costCentreTypes, getVerificationPathId, isCostCentreApplicable]);

  // Handle workflow group selection
  const workflowGroupsSelection = (selectedWorkflowGroup) => {
    setSelectedWorkflowGroup(selectedWorkflowGroup);
    if (selectedWorkflowGroup) {
      filterWorkflowByGroup(selectedWorkflowGroup.value);
    } else {
      setWorkflowOptions([]);
    }
  };

  // Filter workflows by selected group
  const filterWorkflowByGroup = (groupId) => {
    const workflows = menuWholeData.flatMap(menu => menu.submenuItems || [])
      .filter(submenuItem => submenuItem.groupId === groupId)
      .map(submenuItem => ({
        workflowId: submenuItem.workflowId,
        workflowname: submenuItem.workflowname
      }));

    const uniqueWorkflows = Array.from(new Map(workflows.map(item => [item.workflowname, item])).values());
    const filteredWorkflows = uniqueWorkflows.filter(workflow => !existingWorkflows.includes(workflow.workflowId));
    const formattedWorkflowOptions = filteredWorkflows.map(workflow => ({
      value: workflow.workflowId,
      label: workflow.workflowname
    }));

    setWorkflowOptions(formattedWorkflowOptions);
    setSelectedWorkflow(null);
  };

  // Handle workflow selection change
  const workflowChange = (selectedWorkflow) => {
    setSelectedWorkflow(selectedWorkflow);
    setActiveTab(0);
    
    if (selectedWorkflow) {
      const selectedWorkflowData = menuWholeData.flatMap(menu => menu.submenuItems || [])
        .find(item => item.workflowId === selectedWorkflow.value);
      
      const newIsCostCentreApplicable = selectedWorkflowData?.isCostCentreApplicable || false;
      setIsCostCentreApplicable(newIsCostCentreApplicable);

      // Reset all state
      setRolesByTab({});
      setTempSaveData({});
      setSaveTabs({});
      setValidationError('');

      // Initialize roles based on cost center applicability
      if (newIsCostCentreApplicable) {
        initializeRolesByTab();
      } else {
        setRolesByTab({
          0: [{
            roleId: null,
            approvalLimit: '',
            levelId: 0,
            pathId: 0
          }]
        });
      }
    }
  };

  // Handle approval limit change
  const handleApprovalLimitChange = useCallback((tabIndex, roleIndex, value) => {
    setRolesByTab(prevRoles => {
      const updatedTabRoles = [...(prevRoles[tabIndex] || [])];
      updatedTabRoles[roleIndex] = { 
        ...updatedTabRoles[roleIndex], 
        approvalLimit: value 
      };
      return { ...prevRoles, [tabIndex]: updatedTabRoles };
    });
  }, []);

  // Create role options with used roles filtered out
  const userRoleOptions = useMemo(() => userRoles.map(role => ({
    value: role.roleId,
    label: role.roleName
  })), [userRoles]);

  // Check if all tabs are saved and ready for submission
  const isAllTabsSaved = useMemo(() => {
    if (!isCostCentreApplicable) {
      return Object.keys(tempSaveData).length > 0;
    }
    return costCentreTypes.every((_, index) => saveTabs[index]);
  }, [saveTabs, costCentreTypes, isCostCentreApplicable, tempSaveData]);

  // Get role label based on level
  const getRoleLabel = useCallback((roleIndex) => {
    if (roleIndex === 0) return 'Creator Level -1';
    return `Verifier Level ${roleIndex}`;
  }, []);

  // Submit the workflow hierarchy
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedWorkflow) {
      setValidationError('Please select a workflow');
      return;
    }

    let workflowDetails = [];
    
    if (isCostCentreApplicable) {
      Object.entries(tempSaveData).forEach(([_, tabData]) => {
        workflowDetails = [...workflowDetails, ...tabData.roles];
      });
    } else {
      workflowDetails = (tempSaveData[0]?.roles || []).map((role, index) => ({
        ...role,
        pathId: index === 0 ? 0 : 1,
        levelId: index,
        costCentreType: null
      })) || [];
    }

    const payload = {
      workflowId: selectedWorkflow.value,
      workflowname: selectedWorkflow.label,
      isCostCentreApplicable,
      workflowDetails
    };

    try {
      await dispatch(createPermissionThunk(payload)).unwrap();
      setHierarchyPopup(false);
      showToast('success', 'Workflow hierarchy saved successfully');
      resetForm();
    } catch (error) {
      showToast('error', error?.error || 'Error saving workflow hierarchy');
    }
  };

  // Reset form and close dialogs
  const resetForm = () => {
    // Close the popup first
    setHierarchyPopup(false);
    
    // Then reset all form state
    setSelectedWorkflow(null);
    setSelectedWorkflowGroup(null);
    setRolesByTab({});
    setTempSaveData({});
    setSaveTabs({});
    setValidationError('');
    setSuccessDialogOpen(false);
  };

  // Open hierarchy popup
  const addNewHierarchy = () => {
    // Clear any previous state before opening the popup
    setSelectedWorkflow(null);
    setSelectedWorkflowGroup(null);
    setRolesByTab({});
    setTempSaveData({});
    setSaveTabs({});
    setValidationError('');
    setSuccessDialogOpen(false);
    
    // Then open the popup
    setHierarchyPopup(true);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Assign Workflow Hierarchy
          </CardTitle>
          <CardDescription>
            Configure approval workflow hierarchies and assign roles to different levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={addNewHierarchy}
            className="px-4 py-2 rounded-lg bg-indigo-500 inline-flex items-center text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FiPlus className="mr-2" /> Add New Hierarchy
          </button>
        </CardContent>
      </Card>
      
      {/* View existing workflows */}
      <ViewWorkFlow onEditWorkflow={(workflow) => {
        // Handle edit functionality if needed
      }} />
      
      {/* Add/Edit Hierarchy Dialog */}
      {hierarchyPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Assign Workflow Hierarchy</h2>
              <button
                onClick={() => setHierarchyPopup(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="text-gray-500" size={24} />
              </button>
            </div>
            
            {validationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{validationError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="groupDropdown" className="block text-sm font-medium text-gray-700 mb-1">
                    Workflow Group
                  </label>
                  <Select
                    id="groupDropdown"
                    value={selectedWorkflowGroup}
                    onChange={workflowGroupsSelection}
                    options={workflowGroups}
                    placeholder="Select a workflow group"
                    classNamePrefix="react-select"
                    className="react-select-container"
                  />
                </div>
                <div>
                  <label htmlFor="workflowDropdown" className="block text-sm font-medium text-gray-700 mb-1">
                    Workflow Name
                  </label>
                  <Select
                    id="workflowDropdown"
                    value={selectedWorkflow}
                    onChange={workflowChange}
                    options={workflowOptions}
                    placeholder="Select workflow"
                    isDisabled={!selectedWorkflowGroup}
                    classNamePrefix="react-select"
                    className="react-select-container"
                  />
                </div>
              </div>
              
              {selectedWorkflow && (
                <div className="mt-6 border-t pt-4">
                  {isCostCentreApplicable ? (
                    <HierarchyTabs
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      costCentreTypes={costCentreTypes}
                    >
                      {costCentreTypes.map((costCentreType, tabIndex) => (
                        <div 
                          key={`${costCentreType.value}-${tabIndex}`} 
                          className={`flex flex-col gap-4 ${saveTabs[tabIndex] ? 'opacity-80' : ''}`}
                        >
                          <div className="flex items-center mb-2">
                            <FiLayers className="mr-2 text-indigo-500" />
                            <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              {costCentreType.label}
                            </span>
                            {saveTabs[tabIndex] && (
                              <span className="ml-2 text-green-600 flex items-center">
                                <IoMdCheckmarkCircle className="mr-1" /> Saved
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                            {(rolesByTab[tabIndex] || []).map((role, roleIndex) => (
                              <div key={`${tabIndex}-${roleIndex}`} className="flex flex-wrap items-center gap-3 p-2 border border-gray-200 bg-white rounded-md">
                                <div className="flex items-center min-w-[150px]">
                                  {roleIndex === 0 ? (
                                    <BiSolidLayerPlus className="text-blue-500 mr-1" />
                                  ) : (
                                    <FiUsers className="text-green-500 mr-1" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {getRoleLabel(roleIndex)}
                                  </span>
                                </div>
                                
                                <div className="flex-grow">
                                  <Select
                                    id={`role-${tabIndex}-${roleIndex}`}
                                    className="min-w-[200px]"
                                    placeholder="Select Role Name"
                                    options={userRoleOptions.filter(option =>
                                      !(rolesByTab[tabIndex] || []).some(r => r.roleId === option.value && r !== role)
                                    )}
                                    value={userRoleOptions.find(option => option.value === role.roleId)}
                                    onChange={(selectedRole) => handleRoleChange(tabIndex, roleIndex, selectedRole)}
                                    isDisabled={saveTabs[tabIndex]}
                                  />
                                </div>
                                
                                {selectedWorkflowGroup && selectedWorkflowGroup.value === 100 && (
                                  <div className="flex items-center">
                                    <label htmlFor={`approvalLimit-${tabIndex}-${roleIndex}`} className="text-sm mr-2">
                                      <FiSettings className="inline mr-1 text-indigo-500" /> Limit:
                                    </label>
                                    <input
                                      type="number"
                                      id={`approvalLimit-${tabIndex}-${roleIndex}`}
                                      value={role.approvalLimit}
                                      onChange={(e) => handleApprovalLimitChange(tabIndex, roleIndex, e.target.value)}
                                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-400 focus:ring-1 focus:border-indigo-500 w-24"
                                      disabled={saveTabs[tabIndex]}
                                    />
                                  </div>
                                )}
                                
                                {(rolesByTab[tabIndex] || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => deleteRow(tabIndex, roleIndex)}
                                    className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors"
                                    title="Remove role"
                                    disabled={saveTabs[tabIndex]}
                                  >
                                    <TiDelete size={20} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex space-x-3 mt-2">
                            <button
                              type="button"
                              onClick={() => addNewLine(tabIndex)}
                              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                saveTabs[tabIndex]
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              disabled={saveTabs[tabIndex]}
                            >
                              <IoIosAddCircle className="mr-1" /> Add Role
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => tempSave(tabIndex)}
                              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                saveTabs[tabIndex]
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                              disabled={saveTabs[tabIndex]}
                            >
                              <FiSave className="mr-1" /> Save Tab
                            </button>
                          </div>
                        </div>
                      ))}
                    </HierarchyTabs>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                        {(rolesByTab[0] || []).map((role, roleIndex) => (
                          <div key={roleIndex} className="flex flex-wrap items-center gap-3 p-2 border border-gray-200 bg-white rounded-md">
                            <div className="flex items-center min-w-[150px]">
                              {roleIndex === 0 ? (
                                <BiSolidLayerPlus className="text-blue-500 mr-1" />
                              ) : (
                                <FiUsers className="text-green-500 mr-1" />
                              )}
                              <span className="text-sm font-medium">
                                {getRoleLabel(roleIndex)}
                              </span>
                            </div>
                            
                            <div className="flex-grow">
                              <Select
                                id={`role-${roleIndex}`}
                                className="min-w-[200px]"
                                placeholder="Select Role Name"
                                options={userRoleOptions.filter(option =>
                                  !(rolesByTab[0] || []).some(r => r.roleId === option.value && r !== role)
                                )}
                                value={userRoleOptions.find(option => option.value === role.roleId)}
                                onChange={(selectedRole) => handleRoleChange(0, roleIndex, selectedRole)}
                                isDisabled={saveTabs[0]}
                              />
                            </div>
                            
                            {selectedWorkflowGroup && selectedWorkflowGroup.value === 100 && (
                              <div className="flex items-center">
                                <label htmlFor={`approvalLimit-${roleIndex}`} className="text-sm mr-2">
                                  <FiSettings className="inline mr-1 text-indigo-500" /> Limit:
                                </label>
                                <input
                                  type="number"
                                  id={`approvalLimit-${roleIndex}`}
                                  value={role.approvalLimit}
                                  onChange={(e) => handleApprovalLimitChange(0, roleIndex, e.target.value)}
                                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-400 focus:ring-1 focus:border-indigo-500 w-24"
                                  disabled={saveTabs[0]}
                                />
                              </div>
                            )}
                            
                            {(rolesByTab[0] || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteRow(0, roleIndex)}
                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove role"
                                disabled={saveTabs[0]}
                              >
                                <TiDelete size={20} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-3 mt-2">
                        <button
                          type="button"
                          onClick={() => addNewLine(0)}
                          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                            saveTabs[0]
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                          disabled={saveTabs[0]}
                        >
                          <IoIosAddCircle className="mr-1" /> Add Role
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => tempSave(0)}
                          className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                            saveTabs[0]
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                          disabled={saveTabs[0]}
                        >
                          <FiSave className="mr-1" /> Save Tab
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t mt-4 space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md font-medium ${
                    isAllTabsSaved && selectedWorkflow
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAllTabsSaved || !selectedWorkflow || loading}
                >
                  {loading ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Workflow hierarchy has been saved successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetForm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AssignHierarchy;