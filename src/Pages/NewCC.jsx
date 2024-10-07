import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { fetchStates } from '../Slices/stateSlices'
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices'
import { VscError } from "react-icons/vsc";
import { FaCircleCheck } from "react-icons/fa6";
import axios from 'axios'
import ConfirmModal from '../Components/ConfirmModal'
import Success from '../Components/Success'


function NewCC() {

  const dispatch = useDispatch()

  const [selectedCostCentreType, setSelectedCostCentreType] = useState(null)
  const [selectedSubCCType, setSelectedSubCCType] = useState(null)
  const [subCCType, setSubCCType] = useState([])
  
  const [formData, setFormData] = useState({
    ccNo: '',
    ccName: '',
    location: '',
    address:'',
    projectHandling: {
      name: '',
      designation: '',
      phone: ''
    },
    client: {
      name: '',
      address: '',
      phone: ''
    },
    contact: {
      name: '',
      designation: '',
      phone: ''
    },
    finalOfferRef: {
      finalOfferRef: '',
      finalOfferDate: ''
    },
    finalAcceptanceRef: {
      finalAcceptanceRef: '',
      finalAcceptanceDate: ''
    },
    dayLimit: '',
    voucherLimit: ''
  });
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [ccNoStatus, setCcNoStatus] = useState(null)
  const [isConfirm, setIsConfirm] = useState(false)


  const { ccstate } = useSelector((state) => state.ccstate)
  const costCentreTypes = useSelector((state => state.costCentreTypes.costCentreTypes))

  useEffect(() => {
    dispatch(fetchStates())
    dispatch(fetchCostCentreTypes())


  }, [dispatch])
  useEffect(() => {
    if (selectedCostCentreType) {
      const selectedType = costCentreTypes.find(type => type.label === selectedCostCentreType.label)
      setSubCCType(selectedType ? selectedType.subType : [])
      setSelectedSubCCType(null)
    }else{
      setSubCCType([])
      setSelectedSubCCType(null)
    }


  }, [selectedCostCentreType, costCentreTypes])





  const stateOptions = ccstate.length > 0 ? ccstate[0].states.map((option => ({
    value: option.code,
    label: option.name

  }))) : []

  const handleCostCentreTypeChange = (selectedOption) => {
    setSelectedCostCentreType(selectedOption)
    setFormData(prevState => ({
      ...prevState,
      ccType:selectedOption.value,
      subCCType: null
    }))
  }

  const isPerforming  = ()=>{
    return selectedCostCentreType && selectedCostCentreType.label && selectedCostCentreType.value &&
    (selectedCostCentreType.label === 'Performing' || selectedCostCentreType.value === parseInt(102))
  };

  const handleSubCostCentreType = (selectedOption) => {
    setSelectedSubCCType(selectedOption)

  }
  console.log('selected sub cc', selectedSubCCType)

  const handleInputChange = async (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    if (name === 'ccNo') {
      const formatedValue = `CC-${value}`
      try {
        const response = await axios.get(`/api/costcentres/checkccno/${formatedValue}`)
        setCcNoStatus(response.data.exists ? 'exists' : 'available')

      } catch (error) {
        console.error('Error checking ccNo:', error)
        setCcNoStatus(null)

      }
    }
  }

  const handleNestedChange = (section, e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value
      }
    })
  }

  const handleDateChange = (section, name, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: value
      }
    })
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    const costCentreData = {
      ...formData,
      
      ccType: selectedCostCentreType.value,
      subCCType: selectedSubCCType ? selectedSubCCType.value : null,
      levelId: 1,
      status: 'Verification'
    };

    if(selectedCostCentreType.label !=='Performing'){
      delete costCentreData.projectHandling
      delete costCentreData.client
      delete costCentreData.contact
    } else {
      delete costCentreData.address
    }
    try {
      const response = await axios.post('/api/costcentres/createcostcentre', costCentreData)

      setSuccess('Cost Centre Created Successfully')
      setError(null)
      console.log('Data CC Details:', response)
      setFormData({
        ccNo: '',
        ccName: '',
        location: '',
        address:'',
        projectHandling:selectedCostCentreType.label ==='Performing' ? {
          name: '',
          designation: '',
          phone: ''
        }: undefined,
        client: selectedCostCentreType.label ==='Performing' ?{
          name: '',
          address: '',
          phone: ''
        }:undefined,
        contact:selectedCostCentreType.label ==='Performing' ? {
          name: '',
          designation: '',
          phone: ''
        }:undefined,
        finalOfferRef: {
          finalOfferRef: '',
          finalOfferDate: ''
        },
        finalAcceptanceRef: {
          finalAcceptanceRef: '',
          finalAcceptanceDate: ''
        },
        dayLimit: '',
        voucherLimit: ''
      })
      setSelectedCostCentreType(null)
      setSelectedSubCCType(null)
      

    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      setSuccess(null);

    }
  }


  const handleConfirm = async (e)=>{
    e.preventDefault()
    setIsConfirm(true)
  }

  const onCancel = async ()=>{
    setIsConfirm(false)
    setSuccess(false)
  }




  return (
    <div className="px-5 py-3">
      <form onSubmit={handleConfirm}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="m-1 px-2 py-2">
            <label htmlFor="cctype" className="block text-sm font-medium text-gray-700">Cost Centre Type</label>
            <Select className="mt-1"
              options={costCentreTypes}
              value={selectedCostCentreType}
              onChange={handleCostCentreTypeChange}
              placeholder='Cost Centre Type '

            />
          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="ccsubtype" className="block text-sm font-medium text-gray-700">Cost Centre sub Type</label>

            <Select className="mt-1"
              options={subCCType}
              placeholder=' Sub CC Type'
              onChange={handleSubCostCentreType}
              value={selectedSubCCType}
              isDisabled ={!selectedCostCentreType}
            />

          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="ccnumber" className="block text-sm font-medium text-gray-700">Cost Centre Number</label>
            <div className='flex items-center'>
              <input placeholder='Enter a CC Code Number' type="text" className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${ccNoStatus=== 'exists' ? 'text-red-600 border-red-600':''}` }
                onChange={handleInputChange}
                value={formData.ccNo}
                name='ccNo'
              />
              {
                ccNoStatus === 'exists' ? (
                  <VscError className='ml-1 text-red-600' />

                ) : ccNoStatus === 'available' ? (
                  <FaCircleCheck className='ml-1 text-green-600' />
                ) : null
              }

            </div>

          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="ccname" className="block text-sm font-medium text-gray-700">Cost Centre Name</label>
            <input
              name='ccName'
              onChange={handleInputChange}
              value={formData.ccName}
              type="text" className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />

          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location/State</label>
            <Select className="mt-1"
              options={stateOptions}
              onChange={(selectedOption) => setFormData({ ...formData, location: selectedOption.value })}
              value={stateOptions.find(option => option.value === formData.location)}

              placeholder='Select a State'

            />
          </div>
          {isPerforming() && (
          <>
          <div className="m-1 px-2 py-2">
            <label htmlFor="incharge" className="block text-sm font-medium text-gray-700">Project Handling</label>
            <input name='name' type="text" placeholder='Name' className='mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm '
              onChange={(e) => handleNestedChange('projectHandling', e)} value={formData.projectHandling?.name || ''} />
            <input name='designation' type="text" placeholder='Designation' className=' mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm '
              onChange={(e) => handleNestedChange('projectHandling', e)} value={formData.projectHandling?.designation||''} />
            <input name='phone' type="number" placeholder='Phone Number' className=' mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm '
              onChange={(e) => handleNestedChange('projectHandling', e)} value={formData.projectHandling?.phone ||''} />
          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="client" className="block text-sm font-medium text-gray-700">Client Details</label>
            <input
              name='name'
              onChange={(e) => handleNestedChange('client', e)} value={formData.client?.name||''}
              type="text" placeholder='Client Name' className=' mt-1appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
            <input
              name='address'
              onChange={(e) => handleNestedChange('client', e)} value={formData.client?.address||''}
              type="text" placeholder='Address' className=' mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
            <input
              name='phone'
              onChange={(e) => handleNestedChange('client', e)} value={formData.client?.phone||''}
              type="number" placeholder='Phone Number' className='mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="clientContact" className="block text-sm font-medium text-gray-700">Client Contact Person </label>
            <input
              name='name'
              onChange={(e) => handleNestedChange('contact', e)} value={formData.contact?.name||''}
              type="text" placeholder='Name' className=' mt-1appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
            <input
              name='designation'
              onChange={(e) => handleNestedChange('contact', e)} value={formData.contact?.designation||''}
              type="text" placeholder='Designation' className=' mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
            <input
              name='phone'
              onChange={(e) => handleNestedChange('contact', e)} value={formData.contact?.phone||''}
              type="number" placeholder='Phone Number' className='mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="offer" className="block text-sm font-medium text-gray-700">Final Offer Ref No</label>
            <input
              name='finalOfferRef'
              onChange={(e) => handleNestedChange('finalOfferRef', e)} value={formData.finalOfferRef?.finalOfferRef||''}
              type="text" className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="offerdate" className="block text-sm font-medium text-gray-700 cursor-pointer">Final Offer Date</label>
            <input type="date"

              onChange={(e) => handleDateChange('finalOfferRef', 'finalOfferDate', e.target.value)} value={formData.finalOfferRef?.finalOfferDate||''}
              className="block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
             

          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="offeaccept" className="block text-sm font-medium text-gray-700">Final Offer Acceptance No</label>
            <input type="text"
              name='finalAcceptanceRef'
              onChange={(e) => handleNestedChange('finalAcceptanceRef', e)} value={formData.finalAcceptanceRef?.finalAcceptanceRef||''}
              className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="offeraccepted" className="block text-sm font-medium text-gray-700 cursor-pointer">Final Offer Accepted Date</label>
            <input type="date"
              onChange={(e) => handleDateChange('finalAcceptanceRef', 'finalAcceptanceDate', e.target.value)} value={formData.finalAcceptanceRef?.finalAcceptanceDate||''}
              className=" block w-full px-3 py-2 border cursor-pointer  border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          </>
          )}
          {
            !isPerforming() && (
              <div className='m-1 px-2 py-2'>
                <label htmlFor="address" className='block text-sm font-medium text-gray-700'>Address</label>
                <textarea name="address" id="address" rows="3"
                className='mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                placeholder='Enter Address'
                value={formData.address}
                onChange={handleInputChange}
                ></textarea>
              </div>
            )
          }
          <div className="m-1 px-2 py-2">
            <label htmlFor="daylimit" className="block text-sm font-medium text-gray-700">Day Limit for Cash Transactions</label>
            <input type="text"
              name='dayLimit'
              onChange={handleInputChange}
              className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
          </div>
          <div className="m-1 px-2 py-2">
            <label htmlFor="voucherlimit" className="block text-sm font-medium text-gray-700">Voucher Limit </label>
            <input type="text"
              name='voucherLimit'
              onChange={handleInputChange}
              className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ' />
          </div>

        </div>
        <div className="m-auto px-2 py-2 items-center flex gap-2">
          <button className=' bg-indigo-600 text-white  py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700' type='submit'>Submit</button>
          <button type='button' className=' bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'>Cancel</button>
        </div>
        <div>
          {isConfirm && (
            <ConfirmModal
            title="Confirm Cost Centre Registration"
            message={`Do you want to Register  ${formData.ccName} and CC Code ${formData.ccNo} as a New Cost Centre `}
            onConfirm={handleSubmit}
            onCancel={onCancel}
            />
          )}
          {error && <div className='text-red-600'>{error} </div>}
          {success && (
            <Success
            onClose={onCancel}
            />
          )}
        </div>
      </form>

    </div>
  )
}

export default NewCC
