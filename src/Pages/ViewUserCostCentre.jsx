import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserRoles } from '../Slices/userRoleSlices';
import { fetchUsers } from '../Slices/usersSlices';
import { 
  fetchUserCostCentresThunk,
  fetchUnassignedCostCentresThunk,
  updateUserCostCentresThunk,
  deleteUserCostCentresThunk
} from '../Slices/userCostCentreSlices';
import { FiEdit, FiTrash2, FiSearch, FiX, FiRefreshCw, FiUser, FiUserCheck, FiDollarSign } from "react-icons/fi";
import { CiLocationOn } from "react-icons/ci";
import Select from 'react-select';
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

// Edit Modal Component
const EditCostCentreModal = ({ isOpen, onClose, item, onSave }) => {
  const dispatch = useDispatch();
  const [selectedCostCentres, setSelectedCostCentres] = useState([]);
  const [availableCostCentres, setAvailableCostCentres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { unassignedCostCentres = [] } = useSelector(state => state.userCostCentre || {});
  
  // Parse current cost centres into the format needed for the Select component
  useEffect(() => {
    if (item) {
      // Get current cost centres as an array
      let costCentresArray = [];
      if (typeof item.costCentres === 'string') {
        costCentresArray = item.costCentres.split(',').map(cc => cc.trim());
      } else if (Array.isArray(item.costCentres)) {
        costCentresArray = item.costCentres;
      }
      
      // Format for Select component
      const formattedCostCentres = costCentresArray.map(cc => ({
        value: cc,
        label: cc,
        isCurrentlyAssigned: true
      }));
      
      setSelectedCostCentres(formattedCostCentres);
      
      // Fetch unassigned cost centres for this user
      dispatch(fetchUnassignedCostCentresThunk(item.userId));
    }
  }, [item, dispatch]);
  
  // Update available cost centres when unassigned cost centres change
  useEffect(() => {
    // Format unassigned cost centres for the Select component
    const formattedUnassigned = unassignedCostCentres.map(cc => ({
      value: cc.ccNo,
      label: `${cc.ccNo} - ${cc.ccName}`,
      isCurrentlyAssigned: false
    }));
    
    setAvailableCostCentres([...selectedCostCentres, ...formattedUnassigned]);
  }, [unassignedCostCentres, selectedCostCentres]);
  
  const handleCostCentreChange = (options) => {
    setSelectedCostCentres(options || []);
  };
  
  const handleSave = () => {
    if (!item) return;
    
    setIsLoading(true);
    
    const payload = {
      userId: item.userId,
      roleId: item.roleId,
      costCentreId: selectedCostCentres.map(cc => cc.value)
    };
    
    dispatch(updateUserCostCentresThunk(payload))
      .then(() => {
        setIsLoading(false);
        showToast('success', 'Cost centres updated successfully');
        onClose();
        onSave();
      })
      .catch(() => {
        setIsLoading(false);
        showToast('error', 'Failed to update cost centres');
      });
  };
  
  // Format option for display in Select
  const formatOptionLabel = ({ value, label, isCurrentlyAssigned }) => (
    <div className="flex items-center">
      <CiLocationOn className={`mr-2 ${isCurrentlyAssigned ? "text-green-500" : "text-gray-400"}`} />
      <span>{label}</span>
      {isCurrentlyAssigned && (
        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
          Current
        </span>
      )}
    </div>
  );
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-lg font-medium flex items-center">
            <FiEdit className="mr-2 text-indigo-600" />
            Edit Cost Centre Assignment
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="mb-5">
          <div className="flex items-center mb-2">
            <FiUser className="text-indigo-500 mr-2" />
            <p className="text-sm font-medium text-gray-700">
              {item?.userName}
            </p>
          </div>
          <div className="flex items-center">
            <FiUserCheck className="text-indigo-500 mr-2" />
            <p className="text-sm text-gray-600">
              {item?.roleName}
            </p>
          </div>
        </div>
        
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">Select Cost Centres</label>
          <Select
            isMulti
            placeholder="Select cost centres"
            options={availableCostCentres}
            value={selectedCostCentres}
            onChange={handleCostCentreChange}
            formatOptionLabel={formatOptionLabel}
            className="text-sm"
            classNamePrefix="react-select"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can select multiple cost centres by clicking on them.
          </p>
        </div>
        
        <div className="flex justify-end space-x-2 pt-3 border-t">
          <button 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center transition-colors"
            onClick={onClose}
          >
            <FiX className="mr-1" /> Cancel
          </button>
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <FiUserCheck className="mr-1" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

function ViewUserCostCentre({ refreshTrigger }) {
  const dispatch = useDispatch();
  const dataFetchedRef = useRef(false);
  
  // Redux state
  const userRoles = useSelector((state) => state.userRoles?.userRoles || []);
  const users = useSelector((state) => state.users?.users || []);
  const { 
    assignedCostCentres = [], 
    loading = {},
  } = useSelector((state) => state.userCostCentre || {});
  
  // Local state
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Helper functions
  const getUserName = useCallback((userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.userName : userId;
  }, [users]);
  
  const getRoleName = useCallback((roleId) => {
    const role = userRoles.find(role => role.roleId === roleId);
    return role ? role.roleName : roleId;
  }, [userRoles]);
  
  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      if (!dataFetchedRef.current || refreshTrigger) {
        await Promise.all([
          dispatch(fetchUsers()),
          dispatch(fetchUserRoles()),
          dispatch(fetchUserCostCentresThunk())
        ]);
        dataFetchedRef.current = true;
      }
    };
    
    loadInitialData();
  }, [dispatch, refreshTrigger]);
  
  // Process assignments data
  useEffect(() => {
    if (assignedCostCentres.length > 0) {
      const processedData = assignedCostCentres.map(assignment => ({
        ...assignment,
        userName: getUserName(assignment.userId),
        roleName: getRoleName(assignment.roleId),
        costCentres: Array.isArray(assignment.costCentreId)
          ? assignment.costCentreId.join(', ')
          : assignment.costCentreId
      }));
      
      setRowData(processedData);
      
      // Apply search filter if there's a search term
      filterData(processedData);
    } else {
      setRowData([]);
      setFilteredData([]);
    }
  }, [assignedCostCentres, getUserName, getRoleName]);
  
  // Filter data based on search term
  const filterData = useCallback((data = rowData) => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = data.filter(item => 
      (item.userName && item.userName.toLowerCase().includes(term)) || 
      (item.roleName && item.roleName.toLowerCase().includes(term)) || 
      (item.costCentres && item.costCentres.toLowerCase().includes(term))
    );
    
    setFilteredData(filtered);
  }, [searchTerm, rowData]);
  
  // Apply search filter when search term changes
  useEffect(() => {
    filterData();
  }, [searchTerm, filterData]);
  
  // Handle edit click
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };
  
  // Handle delete click
  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedItem) {
      dispatch(deleteUserCostCentresThunk({
        userId: selectedItem.userId,
        roleId: selectedItem.roleId
      }));
      setDeleteDialogOpen(false);
      showToast('success', 'Cost centre assignments deleted successfully');
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
    dispatch(fetchUserCostCentresThunk());
  };
  
  // Loading state
  if (loading.fetchAll) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by user, role, or cost centre"
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
            {filteredData.length} {filteredData.length === 1 ? 'Assignment' : 'Assignments'}
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
              <p className="text-gray-500 mb-2">No results match your search criteria.</p>
              <button
                onClick={handleClearSearch}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Clear search
              </button>
            </>
          ) : (
            <p className="text-gray-500">No cost centre assignments found.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Centres
                </th>
                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FiUser className="text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{item.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FiUserCheck className="text-gray-400 mr-2" />
                      <span className="text-gray-600">{item.roleName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.costCentres.split(',').map((cc, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-full"
                        >
                          <CiLocationOn className="mr-1 text-indigo-500" />
                          {cc.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit assignment"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(item)}
                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Delete assignment"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cost Centre Assignments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all cost centre assignments for <span className="font-medium">{selectedItem?.userName}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Modal */}
      <EditCostCentreModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={selectedItem}
        onSave={handleRefresh}
      />
    </div>
  );
}

export default ViewUserCostCentre;