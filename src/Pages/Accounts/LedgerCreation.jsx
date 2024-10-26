import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAccountGroups } from '../../Slices/groupSlices'
import { createNewLedger, resetLedgerState, checkLedgerNameUniqueness} from '../../Slices/ledgerSlices'
import { showToast } from '../../utilities/toastUtilities';
import CustomDatePicker from '../../Components/CustomDatePicker';



function LedgerCreation() {

    const dispatch = useDispatch()
    const { loading, error, success, isLedgerNameUnique} = useSelector((state) => state.ledger)
    const {groups} = useSelector((state) => state.group)

 
    
    const initialFormState =useMemo(() =>( {
        ledgerName: '',
        groupId: '',
        openingBalance:0,
        balanceType:'',
        balanceAsOn: new Date(),
        isTDSApplicable:false,
        isTCSApplicable:false,
        isGSTApplicable:false,
        remarks:''
    }), [])
    const [formData, setFormData] = useState(initialFormState)

    useState(()=>{
        console.log('Groups logged in ledger', groups)
    },[groups])

    const handleReset = useCallback(() => {
        setFormData(initialFormState);
    }, [initialFormState]);



    useEffect(()=>{ 
        dispatch(fetchAccountGroups())
    }, [dispatch])

    useEffect(() => {
        if(success){
            showToast('success', 'Ledger submitted successfully')
            handleReset()
            dispatch(resetLedgerState())
        }
    }, [success, dispatch, handleReset])

    useEffect(()=> {
        if(error){
            showToast('error', error)
        }
    },[error])

    const handleChange = useCallback((e) => {
        const {name, value, type, checked} = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }))

        if(name === 'ledgerName'){
            dispatch(checkLedgerNameUniqueness(value))
        }
    },[dispatch])

    const handleDateChange = useCallback((date) => {
        setFormData(prevState => ({
            ...prevState,
            balanceAsOn: date
        }));
    },[])

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if(!formData.remarks.trim()){
            showToast('warning', 'Please add remarks before submitting')
            return
        }
        if(isLedgerNameUnique === false) {
            showToast('error', 'Ledger name already exist');
            return
        }
        dispatch(createNewLedger(formData))
        
    },[formData, isLedgerNameUnique, dispatch])

   
   

  return (
<div className=" container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Ledger</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="ledgerName" className="block text-sm font-medium text-gray-700">Ledger Name</label>
                        <input
                            type="text"
                            id="ledgerName"
                            name="ledgerName"
                            value={formData.ledgerName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="groupId" className="block text-sm font-medium text-gray-700">Account Group</label>
                        <select
                            id="groupId"
                            name="groupId"
                            value={formData.groupId}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select a group</option>
                            {groups.map((group) => (
                                <option key={group._id} value={group._id}>
                                    {group.groupName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700">Opening Balance</label>
                        <input
                            type="number"
                            id="openingBalance"
                            name="openingBalance"
                            value={formData.openingBalance}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="balanceType" className="block text-sm font-medium text-gray-700">Balance Type</label>
                        <select
                            id="balanceType"
                            name="balanceType"
                            value={formData.balanceType}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select balance type</option>
                            <option value="Dr">Dr</option>
                            <option value="Cr">Cr</option>
                        </select>
                    </div>
                    <div>
                        <CustomDatePicker
                        selectedDate={formData.balanceAsOn}
                        onChange={handleDateChange}
                        label="Balance As On"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isTDSApplicable"
                            name="isTDSApplicable"
                            checked={formData.isTDSApplicable}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isTDSApplicable" className="ml-2 block text-sm text-gray-700">TDS Applicable</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isTCSApplicable"
                            name="isTCSApplicable"
                            checked={formData.isTCSApplicable}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isTCSApplicable" className="ml-2 block text-sm text-gray-700">TCS Applicable</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isGSTApplicable"
                            name="isGSTApplicable"
                            checked={formData.isGSTApplicable}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isGSTApplicable" className="ml-2 block text-sm text-gray-700">GST Applicable</label>
                    </div>
                </div>
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
                        {loading ? 'Creating...' : 'Create Ledger'}
                    </button>
                </div>
            </form>
        </div>
  )
}

export default LedgerCreation
