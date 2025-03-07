import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRoles } from '../Slices/userRoleSlices';
import { fetchUsers } from '../Slices/usersSlices';
import { 
  fetchUserCostCentresThunk, 
  fetchUsersWithCostCentreApplicableThunk,
  fetchUnassignedCostCentresThunk, 
  assignCostCentreThunk, 
  clearOperationState
} from '../Slices/userCostCentreSlices';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/Card';
import { showToast } from '../utilities/toastUtilities';
import ViewUserCostCentre from './ViewUserCostCentre';

function UserCostCentre() {
  const dispatch = useDispatch();
  
  // Redux state with safety checks
  const userRoles = useSelector((state) => state.userRoles?.userRoles || []);
  const { 
    applicableUsers = [], 
    unassignedCostCentres = [],
    loading = {},
    errors = {},
    success = {}
  } = useSelector((state) => state.userCostCentre || {});

  // Local state
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCostCentres, setSelectedCostCentres] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Initial data loading - only once
  useEffect(() => {
    if (initialLoad) {
      dispatch(fetchUserRoles());
      dispatch(fetchUsers());
      dispatch(fetchUsersWithCostCentreApplicableThunk());
      setInitialLoad(false);
    }
  }, [dispatch, initialLoad]);

  // Handle success and error states
  useEffect(() => {
    // Handle success states
    if (success?.assign) {
      showToast('success', 'Cost centres assigned successfully!');
      resetForm();
      // Only fetch new data when needed
      dispatch(fetchUsersWithCostCentreApplicableThunk());
      setRefreshTrigger(prev => !prev); // Toggle to trigger ViewUserCostCentre refresh
      dispatch(clearOperationState('assign'));
    }
    
    // Handle error states
    if (errors?.assign) {
      showToast('error', errors.assign);
      dispatch(clearOperationState('assign'));
    }
  }, [success, errors, dispatch]);

  // Load unassigned cost centres when a user is selected
  useEffect(() => {
    if (selectedUser) {
      dispatch(fetchUnassignedCostCentresThunk(selectedUser.value));
    }
  }, [selectedUser, dispatch]);

  // Reset form states
  const resetForm = () => {
    setSelectedUser(null);
    setSelectedCostCentres([]);
  };

  // Get user role name
  const getSelectedUserRoleName = () => {
    if (selectedUser) {
      const userRole = userRoles.find(role => role.roleId === selectedUser.roleId);
      return userRole ? userRole.roleName : 'Unknown Role';
    }
    return '';
  };

  // Handle user selection
  const handleUserChange = (option) => {
    setSelectedUser(option);
    setSelectedCostCentres([]);
  };

  // Handle cost centre selection
  const handleCostCentreChange = (options) => {
    setSelectedCostCentres(options || []);
  };

  // Handle form submission for assigning cost centres
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedCostCentres || selectedCostCentres.length === 0) {
      showToast('error', 'Please select both a user and at least one cost centre');
      return;
    }
    
    const payload = {
      userId: selectedUser.value,
      roleId: selectedUser.roleId,
      costCentreId: selectedCostCentres.map(cc => cc.value)
    };
    
    dispatch(assignCostCentreThunk(payload));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Cost Centre Management</h2>
      
      {/* Assign Cost Centre Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assign Cost Centre to User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="max-w-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select User</label>
              <Select
                options={(applicableUsers || []).map(user => ({
                  value: user._id,
                  label: user.userName,
                  roleId: user.roleId
                }))}
                placeholder="Select a user"
                onChange={handleUserChange}
                value={selectedUser}
                className="w-full"
                isLoading={loading?.fetchApplicableUsers}
              />
            </div>
            
            {selectedUser && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">User Role:</span> {getSelectedUserRoleName()}
                </p>
                <label className="block text-sm font-medium mb-1">Select Cost Centres</label>
                <Select
                  options={(unassignedCostCentres || []).map(cc => ({
                    value: cc.ccNo,
                    label: `${cc.ccNo} - ${cc.ccName}`
                  }))}
                  placeholder="Select cost centres"
                  onChange={handleCostCentreChange}
                  value={selectedCostCentres}
                  isMulti
                  className="w-full"
                  isLoading={loading?.fetchUnassigned}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700 disabled:opacity-50"
              disabled={loading?.assign || !selectedUser || !selectedCostCentres || selectedCostCentres.length === 0}
            >
              {loading?.assign ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Assigning...
                </div>
              ) : (
                'Assign Cost Centres'
              )}
            </button>
          </form>
        </CardContent>
      </Card>
      
      {/* View User Cost Centres */}
      <Card>
        <CardHeader>
          <CardTitle>View Assigned Cost Centres</CardTitle>
        </CardHeader>
        <CardContent>
          <ViewUserCostCentre refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  );
}

export default UserCostCentre;