import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { IoIosAddCircle } from "react-icons/io";
import { TiDelete } from "react-icons/ti";
import { useDispatch, useSelector } from 'react-redux';
import ViewWorkFlow from './ViewWorkFlow';
import Success from '../Components/Success';
import { fetchUserRoles } from '../Slices/userRoleSlices';
import HierarchyTabs from '../Components/HierarchyTabs';
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices';


function AssignHierarchy() {
  const dispatch = useDispatch();

  const [isCostCentreApplicable, setIsCostCentreApplicable] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const costCentreTypes = useSelector((state) => state.costCentreTypes.costCentreTypes);
  const [rolesByTab, setRolesByTab] = useState({});

  const [hierarchyPopup, setHierarchyPopup] = useState(false);
  const [menuWholeData, setMenuWholeData] = useState([]);
  const [workflowGroups, setWorkflowGroups] = useState([]);
  const [selectedWorkflowGroup, setSelectedWorkflowGroup] = useState(null);
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [existingWorkflows, setExistingWorkflows] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tempSaveData, setTempSaveData] = useState({})

  const [saveTabs, setSaveTabs] = useState({})
  const [saveMessage, setSavemessage] = useState('')


  const userRoles = useSelector((state) => state.userRoles.userRoles);

  const addNewHierarchy = () => setHierarchyPopup(true);

  const initializeRolesByTab = useCallback(() => {
    setRolesByTab(prevRoles => {
      const newRoles = {}
      costCentreTypes.forEach((costCentreType, index) => {
        newRoles[index] = [{
          roleId: null,
          approvalLimit: '',
          levelId: 0,
          pathId: 0,
          costCentreType: costCentreType.value
        }]
      })
      return newRoles
    })
  }
    , [costCentreTypes]);

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


  const handleRoleChange = useCallback((tabIndex, roleIndex, selectedRole) => {
    setRolesByTab(prevRoles => {
      const updatedTabRoles = [...(prevRoles[tabIndex] || [])]
      updatedTabRoles[roleIndex] = {
        ...updatedTabRoles[roleIndex],
        roleId: selectedRole ? selectedRole.value : null
      }
      return { ...prevRoles, [tabIndex]: updatedTabRoles }
    })
  }, []);

  const addNewLine = useCallback((tabIndex) => {
    setRolesByTab(prevRoles => {
      const currentTabRoles = prevRoles[tabIndex] || [];
      const newIndex = currentTabRoles.length
      const ccid = isCostCentreApplicable ? costCentreTypes[tabIndex]?.value : null
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

  const deleteRow = useCallback((tabIndex, roleIndex) => {
    setRolesByTab(prevRoles => {
      const updatedTabRoles = [...(prevRoles[tabIndex] || [])];
      updatedTabRoles.splice(roleIndex, 1)
      return { ...prevRoles, [tabIndex]: updatedTabRoles };
    });
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await axios.get('/api/usermenudata/getusermenu');
        setMenuWholeData(response.data);
        extractGroups(response.data);
      } catch (error) {
        console.error('Error fetching menuData:', error);
      }
    };



    const fetchExistingWorkflows = async () => {
      try {
        const response = await axios.get('/api/permissions/rolepermissions');
        const existingWorkflowIds = response.data.map(item => item.workflowId);
        setExistingWorkflows(existingWorkflowIds);
      } catch (error) {
        console.error('Error fetching existing workflows:', error);
      }
    };

    fetchMenuData();
    fetchExistingWorkflows();
  }, []);

  useEffect(() => {
    dispatch(fetchUserRoles());
  }, [dispatch]);

  useEffect(() => {
    if (selectedWorkflow) {
      const selectedWorkflowData = menuWholeData.flatMap(menu => menu.submenuItems || [])
        .find(item => item.workflowId === selectedWorkflow.value);
      setIsCostCentreApplicable(selectedWorkflowData?.isCostCentreApplicable || false);
      if (selectedWorkflowData?.isCostCentreApplicable) {
        initializeRolesByTab()
      } else {
        setRolesByTab({
          0: [{
            roleId: null,
            approvalLimit: '',
            levelId: 0,
            pathId: 0
          }]
        })
      }
    }
  }, [selectedWorkflow, menuWholeData, initializeRolesByTab]);

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

  useEffect(() => {
    dispatch(fetchCostCentreTypes())
  }, [dispatch])

  console.log(costCentreTypes)

  const workflowGroupsSelection = (selectedWorkflowGroup) => {
    setSelectedWorkflowGroup(selectedWorkflowGroup);
    filterWorkflowByGroup(selectedWorkflowGroup.value);
  };

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

  const workflowChange = (selectedWorkflow) => {
    setSelectedWorkflow(selectedWorkflow);
    setActiveTab(0);
    const selectedWorkflowData = menuWholeData.flatMap(menu => menu.submenuItems || [])
      .find(item => item.workflowId === selectedWorkflow.value);
    const newIsCostCentreApplicable = selectedWorkflowData?.isCostCentreApplicable || false
    setIsCostCentreApplicable(newIsCostCentreApplicable);

    setRolesByTab({})
    setTempSaveData({})
    setSaveTabs({})

    if (newIsCostCentreApplicable) {
      initializeRolesByTab()

    } else {
      setRolesByTab({
        0: [{
          roleId: null,
          approvalLimit: '',
          levelId: 0,
          pathId: 0

        }]
      })
    }
  };

  const userRoleOptions = useMemo(() => userRoles.map(role => ({
    value: role.roleId,
    label: role.roleName
  })), [userRoles]);

  const tempSave = useCallback((tabIndex) => {
    const currentTabRoles = rolesByTab[tabIndex] || [];
    const ccid = isCostCentreApplicable ? costCentreTypes[tabIndex]?.value : null



    const updatedRoles = currentTabRoles.map((role, index) => {
      const pathId = index === 0 ? 0 : getVerificationPathId(ccid);


      return {
        ...role,
        pathId,
        levelId: index,
        costCentreType: ccid
      }
    })

    setTempSaveData(prevData => ({
      ...prevData,
      [tabIndex]: {
        roles: updatedRoles,

      }
    }))

    setRolesByTab(prevRoles => ({
      ...prevRoles,
      [tabIndex]: updatedRoles
    }))
    setSaveTabs(prevSavedTabs => ({
      ...prevSavedTabs,
      [tabIndex]: true
    }))

    const message = isCostCentreApplicable
      ? `Workflow Saved for ${costCentreTypes[tabIndex].label}`
      : 'Workflow saved Successfully'



    setSavemessage(message)
    setTimeout(() => setSavemessage(''), 3000)
  }, [rolesByTab, costCentreTypes, getVerificationPathId, isCostCentreApplicable])

  const handleSubmit = async (e) => {
    e.preventDefault();

    let workflowDetails = []


    if (isCostCentreApplicable) {
      Object.entries(tempSaveData).forEach(([_, tabData]) => {
        workflowDetails = [...workflowDetails, ...tabData.roles];

      })

    } else {
      workflowDetails = (tempSaveData[0]?.roles || []).map((role, index) => ({
        ...role,
        pathId: index === 0 ? 0 : 1,
        levelId: index,
        costCentreType: null
      })) || []
    }




    const payload = {
      workflowId: selectedWorkflow ? selectedWorkflow.value : null,
      workflowname: selectedWorkflow ? selectedWorkflow.label : '',
      isCostCentreApplicable,
      workflowDetails
    };

    try {
      const response = await axios.post('/api/permissions/rolepermissions', payload);
      console.log('Permission saved', response.data);
      setHierarchyPopup(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error saving permissions:', error);

    }
  };

  const onCancel = () => {
    setHierarchyPopup(false);
    setSelectedWorkflow(null);
    setSelectedWorkflowGroup(null);
    setRolesByTab({});
    setTempSaveData({})
  };

  const handleClose = () => {
    setIsSuccess(false);
    setSelectedWorkflow(null);
    setSelectedWorkflowGroup(null);
    setRolesByTab({});
    setTempSaveData({})
  };

  const getRoleLabel = useCallback((roleIndex) => {
    if (roleIndex === 0) return 'Creator Level -1';
    return `Verifier Level - ${roleIndex}`
  }, [])

  const isAllTabsSaved = useMemo(() => {
    if (!isCostCentreApplicable) {
      return Object.keys(tempSaveData).length > 0
    }
    return costCentreTypes.every((_, index) => saveTabs[index])
  }, [saveTabs, costCentreTypes, isCostCentreApplicable, tempSaveData])

  return (
    <div className='mt-10 mx-8 container'>
      <h2 className='font-semibold text-gray-800'>Assign Workflow Hierarchy</h2>
      <hr />
      <button
        onClick={addNewHierarchy}
        className='px-2 py-2 mt-2 rounded-lg bg-indigo-500 inline-block items-center text-white hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      >
        Add New Hierarchy
      </button>
      <ViewWorkFlow />
      {hierarchyPopup && (
        <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10'>
          <div className='bg-white rounded-lg p-8 fade-in text-gray-600 w-2/4'>
            <h2 className='text-lg font-semibold mb-4'>Assign Hierarchy</h2>
            {saveMessage && (
              <div className=' bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4' role='alert'>
                <span className=' block sm:inline'>{saveMessage}</span>

              </div>
            )}

            <form onSubmit={handleSubmit} className='w-auto'>
              <div>
                <label htmlFor="groupDropdown">Workflow Group</label>
                <Select
                  id='groupDropdown'
                  value={selectedWorkflowGroup}
                  onChange={workflowGroupsSelection}
                  options={workflowGroups}
                  placeholder='Select a workflow Group'
                />
                <label htmlFor="workflowDropdown">Workflow Name</label>
                <Select
                  id='workflowDropdown'
                  value={selectedWorkflow}
                  onChange={workflowChange}
                  options={workflowOptions}
                  placeholder='Select workflow'
                  isDisabled={!selectedWorkflowGroup}
                />
              </div>
              {selectedWorkflow && (
                <>
                  {isCostCentreApplicable ? (
                    <HierarchyTabs
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      costCentreTypes={costCentreTypes}
                    >
                      {costCentreTypes.map((costCentreType, tabIndex) => (
                        <div key={`${costCentreType.ccid}-${tabIndex}`} className={`flex flex-col mt-2 gap-2 text-gray-600 ${saveTabs[tabIndex] ? ' opacity-75 shadow-md' : ''}`}>
                          {(rolesByTab[tabIndex] || []).map((role, roleIndex) => (
                            <div key={`${tabIndex}-${roleIndex}`} className='flex mt-2 items-center gap-2 text-gray-600'>
                              <label htmlFor={`role-${tabIndex}-${roleIndex}`}>{getRoleLabel(roleIndex)}</label>
                              <Select
                                id={`role-${tabIndex}-${roleIndex}`}
                                className='w-60'
                                placeholder='Select Role Name'
                                options={userRoleOptions.filter(option =>
                                  !(rolesByTab[tabIndex] || []).some(r => r.roleId === option.value && r !== role)
                                )}
                                value={userRoleOptions.find(option => option.value === role.roleId)}
                                onChange={(selectedRole) => handleRoleChange(tabIndex, roleIndex, selectedRole)}
                                isDisabled={!selectedWorkflow}
                              />
                              {selectedWorkflowGroup && selectedWorkflowGroup.value === 100 && (
                                <>
                                  <label htmlFor={`approvalLimit-${tabIndex}-${roleIndex}`}>Approval Limit</label>
                                  <input
                                    type="number"
                                    name='approvalLimit'
                                    id={`approvalLimit-${tabIndex}-${roleIndex}`}
                                    value={role.approvalLimit}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      setRolesByTab(prevRoles => {
                                        const updatedTabRoles = [...(prevRoles[tabIndex] || [])];
                                        updatedTabRoles[roleIndex] = { ...role, approvalLimit: newValue };
                                        return { ...prevRoles, [tabIndex]: updatedTabRoles };
                                      });
                                    }}
                                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-400 focus:ring-1 focus:border-indigo-500 w-32'
                                  />
                                </>
                              )}
                              {(rolesByTab[tabIndex] || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => deleteRow(tabIndex, roleIndex)}
                                  className='inline-block items-center px-2 py-2 rounded-full bg-red-600 text-white border hover:bg-red-800 focus:ring-red-800 focus:border-red-800 focus:ring-2'
                                >
                                  <TiDelete className='text-2xl' />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addNewLine(tabIndex)}
                            className={`inline-block items-center px-2 py-2 bg-green-600 rounded-full text-white border hover:bg-green-800 focus:ring-green-800 focus:border-green-800 focus:ring-2 self-start mt-2 ${saveTabs[tabIndex] ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={saveTabs[tabIndex]}
                          >
                            <IoIosAddCircle className='text-2xl' />
                          </button>
                          <button
                            type='button'
                            onClick={() => tempSave(tabIndex)}
                            className={`inline-block items-center px-4 py-2 rounded-lg text-white border focus:ring-2 ${saveTabs[tabIndex]
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-800 focus:ring-indigo-800 focus:border-indigo-800'
                              }`}
                            disabled={saveTabs[tabIndex]}
                          >Save</button>
                        </div>
                      ))}
                    </HierarchyTabs>
                  ) : (
                    <div className='flex flex-col gap-2 mt-2 text-gray-600'>
                      {(rolesByTab[0] || []).map((role, roleIndex) => (
                        <div key={roleIndex} className='flex mt-2 items-center gap-2 text-gray-600'>
                          <label htmlFor={`role-${roleIndex}`}>{getRoleLabel(roleIndex)}</label>
                          <Select
                            id={`role-${roleIndex}`}
                            className='w-60'
                            placeholder='Select Role Name'
                            options={userRoleOptions.filter(option =>
                              !(rolesByTab[0] || []).some(r => r.roleId === option.value && r !== role))}
                            value={userRoleOptions.find(option => option.value === role.roleId)}
                            onChange={(selectedRole) => handleRoleChange(0, roleIndex, selectedRole)}
                            isDisabled={!selectedWorkflow}
                          />
                          {selectedWorkflowGroup && selectedWorkflowGroup.value === 100 && (
                            <>
                              <label htmlFor={`approvalLimit-${roleIndex}`}>Approval Limit</label>
                              <input
                                type="number"
                                name='approvalLimit'
                                id={`approvalLimit-${roleIndex}`}
                                value={role.approvalLimit}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  setRolesByTab(prevRoles => {
                                    const updatedTabRoles = [...(prevRoles[0] || [])];
                                    updatedTabRoles[roleIndex] = { ...role, approvalLimit: newValue };
                                    return { ...prevRoles, 0: updatedTabRoles };
                                  });
                                }}
                                className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-400 focus:ring-1 focus:border-indigo-500 w-32'
                              />
                            </>
                          )}
                          {(rolesByTab[0] || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteRow(0, roleIndex)}
                              className='inline-block items-center px-2 py-2 rounded-full bg-red-600 text-white border hover:bg-red-800 focus:ring-red-800 focus:border-red-800 focus:ring-2'
                            >
                              <TiDelete className='text-2xl' />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addNewLine(0)}
                        className='inline-block items-center px-2 py-2 bg-green-600 rounded-full text-white border hover:bg-green-800 focus:ring-green-800 focus:border-green-800 focus:ring-2 self-start mt-2'
                      >
                        <IoIosAddCircle className='text-2xl' />
                      </button>
                      <button
                        onClick={() => tempSave(0)}
                        type='button'
                        className=' inline-block items-center px-4 py-2 bg-indigo-600 rounded-lg text-white border hover:bg-indigo-800 focus:ring-indigo-800 focus:border-indigo-800 focus:ring-2'
                        disabled ={saveTabs[0]}
                      >Save</button>
                    </div>
                  )}
                </>
              )}
              <div className='flex mt-4 justify-start'>
                <button
                  className='mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'
                  onClick={onCancel}
                  type='button'
                >
                  Cancel
                </button>
                <button
                  className={`font-bold py-2 px-4 rounded ${isAllTabsSaved
                      ? 'bg-indigo-500 hover:bg-indigo-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  type='submit'
                  disabled={!isAllTabsSaved}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isSuccess && (
        <Success
          onClose={handleClose}
        />
      )}
    </div>
  );







}

export default AssignHierarchy
