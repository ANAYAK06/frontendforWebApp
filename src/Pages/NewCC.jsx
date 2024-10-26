import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { fetchStates } from '../Slices/stateSlices'
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices'
import { createNewCostCentre, checkCostCentreNumberUniqueness, resetCostCentreState } from '../Slices/costCentreSlices'
import { showToast } from '../utilities/toastUtilities'
import CustomDatePicker from '../Components/CustomDatePicker'

function NewCC() {
  const dispatch = useDispatch()
  const { loading, error, success, isCostCentreNumberUnique } = useSelector((state) => state.costCentres)
  const { ccstate } = useSelector((state) => state.ccstate)
  const costCentreTypes = useSelector((state) => state.costCentreTypes.costCentreTypes)

  const initialFormState = useMemo(() => ({
    ccNo: '',
    ccName: '',
    ccType: '',
    subCCType: '',
    location: '',
    address: '',
    projectHandling: { name: '', designation: '', phone: '' },
    client: { name: '', address: '', phone: '' },
    contact: { name: '', designation: '', phone: '' },
    finalOfferRef: { finalOfferRef: '', finalOfferDate: '' },
    finalAcceptanceRef: { finalAcceptanceRef: '', finalAcceptanceDate: '' },
    dayLimit: '',
    voucherLimit: '',
    remarks: ''
  }), [])

  const [formData, setFormData] = useState(initialFormState)
  const [selectedCostCentreType, setSelectedCostCentreType] = useState(null)
  const [selectedSubCCType, setSelectedSubCCType] = useState(null)
  const [subCCType, setSubCCType] = useState([])

  const handleReset = useCallback(() => {
    setFormData(initialFormState);
    setSelectedCostCentreType(null);
    setSelectedSubCCType(null);
    // Ensure location is also reset
    setFormData(prev => ({ ...prev, location: '' }));
  }, [initialFormState]);

  useEffect(() => {
    dispatch(fetchStates())
    dispatch(fetchCostCentreTypes())
  }, [dispatch])

  useEffect(() => {
    if (ccstate[0]?.states.length > 0 && !formData.location) {
      setFormData(prev => ({ ...prev, location: ccstate[0].states[0].code }));
    }
  }, [ccstate, formData.location]);

  useEffect(() => {
    if (selectedCostCentreType) {
      const selectedType = costCentreTypes.find(type => type.label === selectedCostCentreType.label)
      setSubCCType(selectedType ? selectedType.subType : [])
      setSelectedSubCCType(null)
    } else {
      setSubCCType([])
      setSelectedSubCCType(null)
    }
  }, [selectedCostCentreType, costCentreTypes])

  useEffect(() => {
    if (success) {
      showToast('success', 'Cost Centre created successfully')
      handleReset()
      dispatch(resetCostCentreState())
    }
  }, [success, dispatch, handleReset])

  useEffect(() => {
    if (error) {
      showToast('error', error)
    }
  }, [error])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (name === 'ccNo') {
      dispatch(checkCostCentreNumberUniqueness(`CC-${value}`))
    }
  }, [dispatch])

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    if (name === 'ccNo' && value) {
      dispatch(checkCostCentreNumberUniqueness(`CC-${value}`))
        .unwrap()
        .then((result) => {
          if (result) {
            showToast('success', 'CC number is available')
          } else {
            showToast('error', 'CC number already exists')
          }
        })
        .catch((error) => {
          showToast('error', 'Error checking CC number')
        })
    }
  }, [dispatch])

  const handleNestedChange = useCallback((section, e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [name]: value
      }
    }))
  }, [])

  const handleDateChange = useCallback((section, name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [name]: value
      }
    }))
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!formData.remarks.trim()) {
      showToast('warning', 'Please add remarks before submitting')
      return
    }
    if (isCostCentreNumberUnique === false) {
      showToast('error', 'Cost Centre number already exists')
      return
    }
    dispatch(createNewCostCentre({
      ...formData,
      ccType: selectedCostCentreType?.value,
      subCCType: selectedSubCCType?.value
    }))
  }, [formData, isCostCentreNumberUnique, selectedCostCentreType, selectedSubCCType, dispatch])

  const isPerforming = selectedCostCentreType?.label === 'Performing' || selectedCostCentreType?.value === 102

  return (
    <div className="container mx-auto p-4 py-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Cost Centre</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost Centre Type</label>
            <Select
              options={costCentreTypes}
              value={selectedCostCentreType}
              onChange={(option) => {
                setSelectedCostCentreType(option)
                setFormData(prev => ({ ...prev, ccType: option.value }))
              }}
              placeholder="Select Cost Centre Type"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost Centre Sub Type</label>
            <Select
              options={subCCType}
              value={selectedSubCCType}
              onChange={(option) => {
                setSelectedSubCCType(option)
                setFormData(prev => ({ ...prev, subCCType: option.value }))
              }}
              placeholder="Select Sub CC Type"
              isDisabled={!selectedCostCentreType}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="ccNo" className="block text-sm font-medium text-gray-700">Cost Centre Number</label>
            <input
              type="text"
              id="ccNo"
              name="ccNo"
              value={formData.ccNo}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="ccName" className="block text-sm font-medium text-gray-700">Cost Centre Name</label>
            <input
              type="text"
              id="ccName"
              name="ccName"
              value={formData.ccName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location/State</label>
            <Select
              options={ccstate[0]?.states.map(state => ({ value: state.code, label: state.name }))}
              value={ccstate[0]?.states
                .filter(state => state.code === formData.location)
                .map(state => ({ value: state.code, label: state.name }))[0]}
              onChange={(selectedOption) => setFormData(prev => ({ ...prev, location: selectedOption.value }))}
              placeholder="Select a State"
              className="mt-1"
            />
          </div>
          {!isPerforming && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
          )}
        </div>

        {isPerforming && (
          <>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project Handling</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.projectHandling.name}
                    onChange={(e) => handleNestedChange('projectHandling', e)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    name="designation"
                    placeholder="Designation"
                    value={formData.projectHandling.designation}
                    onChange={(e) => handleNestedChange('projectHandling', e)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.projectHandling.phone}
                    onChange={(e) => handleNestedChange('projectHandling', e)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Client Details</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Client Name"
                    value={formData.client.name}
                    onChange={(e) => handleNestedChange('client', e)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <textarea
                    name="address"
                    placeholder="Client Address"
                    value={formData.client.address}
                    onChange={(e) => handleNestedChange('client', e)}
                    rows="2"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  ></textarea>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Client Phone Number"
                    value={formData.client.phone}
                    onChange={(e) => handleNestedChange('client', e)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Client Contact Person</h3>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Contact Name"
                  value={formData.contact.name}
                  onChange={(e) => handleNestedChange('contact', e)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  name="designation"
                  placeholder="Contact Designation"
                  value={formData.contact.designation}
                  onChange={(e) => handleNestedChange('contact', e)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Contact Phone Number"
                  value={formData.contact.phone}
                  onChange={(e) => handleNestedChange('contact', e)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Final Offer Reference</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="finalOfferRef"
                    placeholder="Final Offer Reference"
                    value={formData.finalOfferRef.finalOfferRef}
                    onChange={(e) => handleNestedChange('finalOfferRef', e)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <CustomDatePicker
                    selectedDate={formData.finalOfferRef.finalOfferDate}
                    onChange={(date) => handleDateChange('finalOfferRef', 'finalOfferDate', date)}
                    label="Final Offer Date"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Final Acceptance Reference</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="finalAcceptanceRef"
                    placeholder="Final Acceptance Reference"
                    value={formData.finalAcceptanceRef.finalAcceptanceRef}
                    onChange={(e) => handleNestedChange('finalAcceptanceRef', e)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <CustomDatePicker
                    selectedDate={formData.finalAcceptanceRef.finalAcceptanceDate}
                    onChange={(date) => handleDateChange('finalAcceptanceRef', 'finalAcceptanceDate', date)}
                    label="Final Acceptance Date"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="dayLimit" className="block text-sm font-medium text-gray-700">Day Limit for Cash Transactions</label>
            <input
              type="text"
              id="dayLimit"
              name="dayLimit"
              value={formData.dayLimit}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="voucherLimit" className="block text-sm font-medium text-gray-700">Voucher Limit</label>
            <input
              type="text"
              id="voucherLimit"
              name="voucherLimit"
              value={formData.voucherLimit}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
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
            required
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Cost Centre'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewCC