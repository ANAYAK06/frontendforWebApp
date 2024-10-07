import React, { useEffect, useState } from 'react'
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import DCAcodeEdit from './DCAcodeEdit'


function DCAcodes() {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        name: '',
        applicableCostCentres: [],
        applicableForItemCode: false,
        itemCodeType: ''
    })

    const costCentreTypes = useSelector((state) => state.costCentreTypes.costCentreTypes);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        dispatch(fetchCostCentreTypes())
    }, [dispatch])
  
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    


    const handleCostCentreChange = (e, ccTypeValue) => {
        const {checked} = e.target;
        console.log(`Checkbox ${ccTypeValue} changed. Checked: ${checked}`);
        setFormData((prevState)=>{
            let upatedApplicableCostCentres = [...prevState.applicableCostCentres]
            if(checked){
                if(!upatedApplicableCostCentres.some((cc)=>cc.ccid === ccTypeValue)){
                    upatedApplicableCostCentres.push({ccid:ccTypeValue, subId:[]})
                }
            } else {
                upatedApplicableCostCentres = upatedApplicableCostCentres.filter((cc)=>cc.ccid !== ccTypeValue)
            }
            return{
                ...prevState,
                applicableCostCentres:upatedApplicableCostCentres
            }
        })
       
    };
    const handleSubTypeChange = (e, ccTypeValue, subTypeValue) => {
        const { checked } = e.target;
        console.log(`Checkbox ${subTypeValue} changed. Checked: ${checked}`);
        setFormData((prevState)=>{
            const updatedCostCentres = prevState.applicableCostCentres.map((cc)=>{
                if(cc.ccid === ccTypeValue){
                    if(checked){
                        return {...cc, subId:[...cc.subId, subTypeValue]}
                    }else{
                        return {...cc, subId:cc.subId.filter((st)=>st !== subTypeValue)}
                    }
                }
                return cc
            })
            return {...prevState, applicableCostCentres:updatedCostCentres}
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const formDataToSend = {
                ...formData,
                applicableCostCentres:formData.applicableCostCentres.map(cc=>({
                    ...cc,
                    subId: cc.subId || []
                }))
            }
            const response = await axios.post('/api/budgetdca/createdcacode', formDataToSend)
            console.log('DCA Created', response.data)

            setFormData({
                name: '',
                applicableCostCentres: [],
                applicableForItemcode: false,
                itemCodeType: ''

            })

        } catch (error) {
            console.error('Error creating DCA:', error);
            setError('Failed to create DCA. Please try again.');

        } finally {
            setLoading(false)
        }
    }


    return (
        <>
        <div className='container mx-8 mt-10'>
            <h2 className='text-2xl font-semibold mb-4'>Create Detailed Cost Account (DCA)</h2>
            <hr />
            {error && <div className=' alert alert-danger'>{error}</div>}
            <form onSubmit={handleSubmit} className='mx-w-md mx-auto w-80'>
                <div className='mb-3'>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">DCA Name</label>
                    <input type="text"
                         className='mt-1 p-2 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        required />

                </div>
                <div className='mb-3'>
                    <label htmlFor="form-label">Applicable Cost Centres</label>
                    {
                        costCentreTypes.map(ccType => (
                            <div key={ccType.value} className='mb-2'>
                                <div className='form-check'>
                                    <input type="checkbox" className='form-check-input' id={`cc-${ccType.value}`}
                                        checked={formData.applicableCostCentres.some(cc => cc.ccid === ccType.value)}
                                        onChange={(e) => handleCostCentreChange(e, ccType.value)} />
                                    <label htmlFor={`cc-${ccType.value}`}>
                                        {ccType.label} 
                                    </label>

                                </div>
                                {
                                    formData.applicableCostCentres.some(cc => cc.ccid === ccType.value) && (
                                        <div className='ms-4'>
                                            {ccType.subType.map(subType => (
                                                <div key={subType.value}>
                                                    <input type="checkbox"
                                                    
                                                        className='mr-2'
                                                        id={`subType-${subType.value}`}
                                                        checked={formData.applicableCostCentres.find(cc => cc.ccid === ccType.value)?.subId.includes(subType.value)||false}
                                                        onChange={(e) => handleSubTypeChange(e, ccType.value, subType.value)} />
                                                    <label htmlFor={`subtype-${subType.value}`}>
                                                        {subType.label}
                                                    </label>

                                                </div>
                                            ))}

                                        </div>
                                    )
                                }

                            </div>
                        ))
                    }

                </div>
                <div className="mb-3">
                    <input type="checkbox"
                        className='form-check-input'
                        id='applicableForItemCode'
                        name='applicableForItemCode'
                        checked={formData.applicableForItemCode}
                        onChange={handleInputChange} />
                    <label htmlFor="applicableForItemCode">Applicable For Itemcode</label>

                </div>
                {
                    formData.applicableForItemCode && (
                        <div className="mb-3">
                            <label htmlFor="itemCodeType">Itemcode Type</label>
                            <select
                                className='form-select border ml-2'
                                id='itemCodeType'
                                name='itemCodeType'
                                value={formData.itemCodeType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Item Code Type</option>
                                <option value="Service">Service</option>
                                <option value="Material">Material</option>
                            </select>
                        </div>
                    )
                }
                <button type='submit' disabled={loading}  className='w-full mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700'>
                    {loading ? 'Creating...':'Create DCA'}

                </button>
            </form>
            <DCAcodeEdit/>
        </div>
        
        </>
        
    )
}

export default DCAcodes
