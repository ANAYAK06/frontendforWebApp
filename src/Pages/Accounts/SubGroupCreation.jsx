import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAccountGroups, createNewSubgroup, resetSubgroupSuccess, checkSubgroupNameExists } from '../../Slices/groupSlices'
import { showToast } from '../../utilities/toastUtilities';

function SubGroupCreation() {

    const dispatch = useDispatch()
    const { loading, error, subgroupSuccess, nameExists, groups } = useSelector((state) => state.group)

    const initialFormState = useMemo(() => ({
        groupName: '',
        groupUnder: '',
        remarks: ''
    }), [])

    const [formData, setFormData] = useState(initialFormState)
    const [selectedGroupDetails, setSelectedGroupDetails] = useState(null)

    const handleReset = useCallback(() => {
        setFormData(initialFormState);
        setSelectedGroupDetails(null);
    }, [initialFormState]);

    useEffect(() => {
        dispatch(fetchAccountGroups())
    }, [dispatch])

    useEffect(() => {
        if (subgroupSuccess) {
            showToast('success', 'Subgroup created successfully')
            handleReset()
            dispatch(resetSubgroupSuccess())
        }
    }, [subgroupSuccess, dispatch, handleReset])

    useEffect(() => {
        if (error) {
            showToast('error', error)
        }
    }, [error])

    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))

        if (name === 'groupName') {
            dispatch(checkSubgroupNameExists(value))
        }

        if (name === 'groupUnder') {
            const selectedGroup = groups.find(group => group._id === value)
            setSelectedGroupDetails(selectedGroup)
        }
    }, [dispatch, groups])

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!formData.remarks.trim()) {
            showToast('warning', 'Please add remarks before submitting')
            return
        }
        if (nameExists) {
            showToast('error', 'Group name already exists');
            return
        }
        dispatch(createNewSubgroup(formData))
    }, [formData, nameExists, dispatch])




  return (
    <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
    <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Subgroup</h2>
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Subgroup Name</label>
                <input
                    type="text"
                    id="groupName"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div>
                <label htmlFor="groupUnder" className="block text-sm font-medium text-gray-700">Parent Group</label>
                <select
                    id="groupUnder"
                    name="groupUnder"
                    value={formData.groupUnder}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">Select a parent group</option>
                    {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                            {group.groupName}
                        </option>
                    ))}
                </select>
            </div>
        </div>
        {selectedGroupDetails && (
            <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Selected Group Details:</h3>
                <p>Affects Gross Profit: {selectedGroupDetails.affectsGrossProfit ? 'Yes' : 'No'}</p>
                <p>Report Type: {selectedGroupDetails.reportType === 'BS' ? 'Balance Sheet' : 'Profit and Loss'}</p>
            </div>
        )}
        <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea
                id="remarks"
                name="remarks"
                rows="3"
                value={formData.remarks}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
        </div>
        <div className="flex justify-end space-x-4">
            <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Reset
            </button>
            <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Creating...' : 'Create Subgroup'}
            </button>
        </div>
    </form>
</div>
  )
}

export default SubGroupCreation
