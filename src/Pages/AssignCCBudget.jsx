import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices';
import { assignCCBudget, resetAssignmentSuccess } from '../Slices/ccBudgetSlices'
import { showToast } from '../utilities/toastUtilities'
import {fetchEligibleCCForBudget} from '../Slices/costCentreSlices'

function AssignCCBudget() {

    const dispatch = useDispatch()



    const [formData, setFormData] = useState({
        ccid: '',
        subId: '',
        fiscalYear: '',
        ccNo: '',
        applyFiscalYear: false,
        transferPreviousYearBalance: false,
        newBudget: 0,
        remarks: ''

    })


    const [ccOption, setCCOption] = useState([])
    const [fiscalYearOption, setFiscalYearOption] = useState([])
    const [previousYearBalance, setPreviousYearBalance] = useState(0)
    const [totalBudget, setTotalBudget] = useState(0)


    const { loading, error, assignmentSuccess } = useSelector((state) => state.ccBudget)
    const costCentreTypes = useSelector((state) => state.costCentreTypes.costCentreTypes)

    const { 
        eligibleCostCentres, 
        eligibleCCLoading, 
        eligibleCCError 
    } = useSelector(state => state.costCentres);

    useEffect(() => {
        dispatch(fetchCostCentreTypes())
        loadFiscalYearOptions()
    }, [dispatch])

    useEffect(() => {
        if (assignmentSuccess) {
            showToast('success', 'Budget Assigned Successfully')
        }
    }, [assignmentSuccess])

    useEffect(() => {
        if (error) {
            showToast('error', error)
        }
    }, [error])


    const loadFiscalYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => `${currentYear + i}-${currentYear + i + 1}`)
        setFiscalYearOption(years)



    }


    const fetchEligibleCostCentreForBudgetAssign = useCallback(async () => {
        if (formData.ccid && formData.subId) {
            try {
                await dispatch(fetchEligibleCCForBudget({
                    ccid: formData.ccid,
                    subId: formData.subId,
                    fiscalYear: formData.fiscalYear
                })).unwrap();
                
                setCCOption(eligibleCostCentres);
            } catch (error) {
                showToast('error', 'Failed to fetch eligible cost centers');
            }
        }
    }, [dispatch, formData.ccid, formData.subId, formData.fiscalYear, eligibleCostCentres]);




    useEffect(() => {
        fetchEligibleCostCentreForBudgetAssign()

    }, [fetchEligibleCostCentreForBudgetAssign])




    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target

        let updatedFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        }
        if (name === 'ccid') {
            updatedFormData.applyFiscalYear = value === '100' || value === '101'
            updatedFormData.subId =''
            updatedFormData.ccNo = ''
            updatedFormData.fiscalYear = ''
            setPreviousYearBalance(0)

            
        } else if( name === 'subId') {
            updatedFormData.ccNo =''
            
            if(updatedFormData.ccid !== '100' && updatedFormData.ccid !== '101') {
                updatedFormData.fiscalYear = ''
            }
        }
        setFormData(updatedFormData) 

     
        if (name === 'ccNo' && formData.applyFiscalYear && formData.ccid === '102') {
            fetchPreviousYearBalance(value)
        }
        if (name === 'newBudget') {
            const budget = parseFloat(value) || 0
            setTotalBudget(formData.transferPreviousYearBalance ? previousYearBalance + budget : budget)
        }
        if (name === 'transferPreviousYearBalance') {
            setTotalBudget(checked ? previousYearBalance + formData.newBudget : formData.newBudget)
        }
    }

    const fetchPreviousYearBalance = async (ccNo) => {

        try {
            const response = await axios.get(`/api/previous-balance/${ccNo}?fiscalYear=${formData.fiscalYear}`)
            setPreviousYearBalance(response.data.balance)
        } catch (error) {
            console.error('Failed to Fetch previous year balance', error)

        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if((formData.ccid === '100' || formData.ccid === '101' || (formData.ccid === '102' && formData.applyFiscalYear)) && !formData.fiscalYear) {
            showToast('error', 'Please select Financial Year')
        }
        if (!formData.ccNo) {
            showToast('error', 'Please select a Cost Centre Code')
            return
        }
        if (!formData.remarks.trim()) {
            showToast('error', 'Please provide remarks before Assigning Budget')
            return
        }
        try {
            const payload = {
                ...formData,
                ccBudget: formData.newBudget,
                fiscalYear: formData.applyFiscalYear ? formData.fiscalYear : null,
                totalBudget,
                remarks: formData.remarks
            }
            console.log('Submitting payload:', payload)
            await dispatch(assignCCBudget(payload)).unwrap()
            handleClose()

        } catch (error) {
            showToast('error', 'Failed to Assign Budget, Please try again')
            console.error('Failed to assign budget', error)
        }

    }

    const filtteredSubTypes = formData.ccid ? costCentreTypes.find(cc => cc.value === parseInt(formData.ccid))?.subType || [] : [];

    const handleClose = useCallback(() => {
        setFormData({
            ccid: '',
            subId: '',
            fiscalYear: '',
            applyFiscalYear: false,
            transferPreviousYearBalance: false,
            newBudget: 0,
            remarks: '',
            ccNo: ''
        });
        setPreviousYearBalance(0)
        setTotalBudget(0)
        dispatch(resetAssignmentSuccess())


    }, [dispatch])

    const handleBudgetFocus = (e) => {
        e.target.select()
    }


    return (
        <div className=' container mx-auto px-4 py-8 bg-gray-50'>
            <h2 className='text-3xl font-bold mb-6 text-indigo-700'>Assign CC Budget</h2>
            
            <form onSubmit={handleSubmit} className=' space-y-6 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2' htmlFor='ccid' >Cost Centre Type</label>


                        <select
                            id='ccid'
                            value={formData.ccid}
                            name='ccid'
                            onChange={handleInputChange}
                            className=" shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"

                        >
                            <option value="">Select Cost Centre Type</option>
                            {
                                costCentreTypes.map((cc) => (
                                    <option key={cc.value} value={cc.value}>{cc.label}</option>
                                ))
                            }

                        </select>
                    </div>
                    <div>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="subId">Sub Type</label>
                        {
                            formData.ccid && (
                                <select value={formData.subId} name='subId' onChange={handleInputChange} disabled={!formData.ccid}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="">Select Sub Type</option>
                                    {
                                        filtteredSubTypes.map((sub) => (
                                            <option key={sub.value} value={sub.value}>{sub.label}</option>
                                        ))
                                    }
                                </select>
                            )
                        }
                    </div>
                    {
                        formData.ccid === '102' && (
                            <div className='flex items-center'>
                                <input type="checkbox" name='applyFiscalYear' checked={formData.applyFiscalYear} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                                <label htmlFor="" className='ml-2 block text-sm text-gray-900'>

                                    Apply Financial Year <span className=' text-xs text-red-500 ml-2'> *Leave unchecked If you don't want Financial year basis budget</span>
                                </label>
                            </div>
                        )
                    }
                    {formData.ccid === '100' || formData.ccid === '101' || (formData.ccid === '102' && formData.applyFiscalYear) ? (
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Financial Year</label>
                            <select value={formData.fiscalYear} name='fiscalYear' onChange={handleInputChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                <option value="">Select Financial Year</option>
                                {fiscalYearOption.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>


                        </div>
                    ) : null}
                    <div>
                        <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-2'>CC Code</label>
                        <select value={formData.ccNo} name='ccNo' onChange={handleInputChange} disabled={!formData.ccid || (formData.applyFiscalYear && !formData.fiscalYear)} className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="">Select CC Code</option>
                            {
                                ccOption.map((cc) => (
                                    <option key={cc.value} value={cc.value}>{cc.label}</option>
                                ))
                            }
                        </select>
                    </div>
                    {formData.applyFiscalYear && previousYearBalance > 0 && (
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Previous Year Balance:{previousYearBalance}</label>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                <input type="checkbox" name='transferPreviousYearBalance' checked={formData.transferPreviousYearBalance} onChange={handleInputChange} />
                                Transfer Previous Year Budget Balance
                            </label>
                        </div>
                    )}
                    <div>
                        <label htmlFor='newBudget' className='block text-sm font-medium text-gray-700 mb-2'>New Budget</label>
                        <input type="number"
                            id='newBudget'
                            name='newBudget'
                            value={formData.newBudget}
                            onChange={handleInputChange}
                            onFocus={handleBudgetFocus}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>


                    {formData.applyFiscalYear && previousYearBalance > 0 && (
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Total Budget: {totalBudget}</label>
                        </div>
                    )}
                    <div className="col-span-2">
                        <label htmlFor='remarks' className='block text-sm font-medium text-gray-700 mb-2'>Remarks</label>
                        <textarea
                            id='remarks'
                            name='remarks'
                            value={formData.remarks}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    <button type='submit' disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" >{loading ? 'Assigning' : 'Assign Budget'}


                    </button>

                </div>
            </form>

        </div>
    )
}

export default AssignCCBudget
