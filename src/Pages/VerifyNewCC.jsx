import React, { useCallback, useEffect, useState } from 'react'
import { FaChevronDown } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotificationCount } from '../Slices/notificationSlices'
import { fetchStates } from '../Slices/stateSlices'
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices'
import Success from '../Components/Success'
import { SlClose } from "react-icons/sl";

function VerifyNewCC({checkContent}) {

  const [hasContent, setHasContent] = useState(false);

  const [inboxarrowClicked, setInboxarrowClicked] = useState(false)
  const [newCostCentres, setNewCostCentres] = useState([])
  const [selectedCostCentre, setSelectedCostCentre] = useState(null)

  const [success, setSuccess] = useState(false)
  const [rejectCountdown, setRejectCountdown] = useState(null)
  const [isRejecting, setIsRejecting] = useState(false)

  const userRoleId = useSelector(state => state.auth.userInfo.roleId)
  const { ccstate } = useSelector((state) => state.ccstate)
  const costCentreTypes = useSelector((state => state.costCentreTypes.costCentreTypes))



  const dispatch = useDispatch()

 



  useEffect(() => {
    dispatch(fetchStates())
    dispatch(fetchCostCentreTypes())

  }, [dispatch])

  const toggleInboxarrow = () => {
    setInboxarrowClicked(!inboxarrowClicked)
  }


  const fetchCostCentreforVerification = useCallback(async () => {
    try {
      const response = await axios.get(`/api/costcentres/costcentreverification`, { params: { userRoleId } })


      if (!response.data || response.data.length === 0) {

        setNewCostCentres([])
      } else {

        setNewCostCentres(response.data)
      }




    } catch (error) {
      console.error('Error fetching Data:', error);


    }
  }, [userRoleId])

  useEffect(() => {
    if (userRoleId) {
      fetchCostCentreforVerification()
    }
  }, [userRoleId, fetchCostCentreforVerification])



  const handleRowClick = (cc) => {
    setSelectedCostCentre(cc)
  }

  const onCancel = () => {
    setSelectedCostCentre(null)
  }

  const handleConfirm = async () => {
    if (selectedCostCentre) {
      try {
        const response = await axios.patch(`/api/costcentres/verifycostcentre/${selectedCostCentre._id}`, {})
        console.log('Cost Centre Updated:', response.data)
        setSelectedCostCentre(null)
        dispatch(fetchNotificationCount({ userRoleId }))

        setSuccess(true)

        const updatedList = await axios.get(`/api/costcentres/costcentreverification`, { params: { userRoleId } })


        if (updatedList.data && Array.isArray(updatedList.data)) {

          setNewCostCentres(updatedList.data)
        } else {

          setNewCostCentres([])
        }



      } catch (error) {
        console.error('Error updating Cost Centre:', error);

      }
    }
  }

  const getStateName = (id) => {
    const state = ccstate[0]?.states.find((state) => state.code === id)
    return state ? state.name : id
  }

  const getCostCentreTypeName = (id) => {
    const typeId = parseInt(id)
    const type = costCentreTypes.find((type) => type.value === typeId)
    return type ? type.label : id
  }

  const getSubType = useCallback((subTypeId) => {
    for (const ccType of costCentreTypes) {
      const subType = ccType.subType.find(sub => sub.value === parseInt(subTypeId))
      if (subType) {
        return subType.label
      }
    }
    return subTypeId
  }, [costCentreTypes])


  const onClose = () => {
    setSuccess(false)
  }

  const onReject = useCallback(async () => {
    if (!selectedCostCentre) return
    setIsRejecting(true)
    try {
      const response = await axios.patch(`/api/costcentres/rejectcostcentre/${selectedCostCentre._id}`, {});
      console.log('Cost centre Rejected', response.data)
      fetchCostCentreforVerification()
      setSelectedCostCentre(null)
      dispatch(fetchNotificationCount({ userRoleId }))

    } catch (error) {
      console.error('Error rejecting Cost Centre:', error);

    } finally {
      setIsRejecting(false)
    }

  }, [selectedCostCentre, fetchCostCentreforVerification, dispatch, userRoleId])

  useEffect(() => {
    let timer
    if (rejectCountdown !== null && rejectCountdown > 0) {
      timer = setTimeout(() => setRejectCountdown(prev => prev - 1), 1000)

    } else if (rejectCountdown === 0) {
      onReject()
      setRejectCountdown(null)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [rejectCountdown, onReject])

  const handleRejectClick = () => {
    if (rejectCountdown === null) {
      setRejectCountdown(10)
    } else {
      setRejectCountdown(null)
      console.log('Rejection Cancelled')
    }
  }

  const isPerforming = () => {

    return selectedCostCentre && (
      selectedCostCentre.ccType === 'Perfoming' || selectedCostCentre.ccType === '102'
    )
  }
  if(!newCostCentres || newCostCentres.length === 0) return null

  return (
    <>
      { newCostCentres.length > 0 && (

        <div className='w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4'>
          

            <div className='p-4  bg-slate-100 flex justify-between items-center'>
              <div className=' flex justify-between items-center'>
                <div className='px-2 py-2 rounded-full bg-slate-300 cursor-pointer' onClick={toggleInboxarrow}><FaChevronDown className={`' text-gray-600 font-bold' ${inboxarrowClicked && 'rotate-180 duration-300'}`} /></div>
                <div><h3 className='text-gray-600 font-bold'>New Cost Centre </h3></div>
                <div className='font-bold text-red-500'>({newCostCentres.length})</div>
              </div>
              <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxarrowClicked ? 'max-h-screen' : 'max-h-0'}`}>
                {
                  inboxarrowClicked && (
                    <div className='p-4 bg-white'>
                      <div className=' overflow-x-auto'>
                        <table className='min-w-full'>
                          <thead className='text-gray-700'>
                            <tr>
                              <th className=' border px-4 py-2'>Action</th>
                              <th className=' border px-4 py-2'>No</th>
                              <th className=' border px-4 py-2'>Name</th>
                              <th className=' border px-4 py-2'>Date</th>
                              <th className=' border px-4 py-2'>Location</th>
                            </tr>
                          </thead>
                          <tbody className='item-centre justify-center'>

                            {
                              newCostCentres.map((cc) => (
                                <tr key={cc._id}>
                                  <td className=' border px-4 py-2'><FaRegEdit className='text-yellow-600 cursor-pointer text-2xl' onClick={() => handleRowClick(cc)} /></td>
                                  <td className=' border px-4 py-2'>{cc.ccNo}</td>
                                  <td className=' border px-4 py-2'>{cc.ccName}</td>
                                  <td className=' border px-4 py-2'>{new Date(cc.createdAt).toLocaleDateString()}</td>
                                  <td className=' border px-4 py-2'>{getStateName(cc.location)}</td>
                                </tr>

                              ))
                            }


                          </tbody>
                        </table>

                      </div>

                    </div>
                  )
                }
              </div>

            </div>




         
          {
            selectedCostCentre && (
              <div className={` fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10 w-full`}>
                <div className='bg-white rounded-lg p-8 fade-in justify-between w-3/4'>
                  <div className=' flex justify-between items-center mb-4'>
                    <h2 className='text-lg font-bold mb-4'>Verify cost Centre</h2>
                    <button onClick={onCancel} className='text-red-400 rounded-full border text-4xl hover:bg-red-400 transition-all hover:text-red-100'><SlClose /></button>

                  </div>
                  <hr />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ">
                    <div className='m-1 px-2 py-2'>
                      <label htmlFor="cctype" className="block text-sm font-medium text-gray-700">Cost Centre Type:</label>
                      <p>{getCostCentreTypeName(selectedCostCentre.ccType)}</p>

                    </div>
                    <div className='m-1 px-2 py-2'>
                      <label htmlFor="cctype" className="block text-sm font-medium text-gray-700">Cost Centre Sub Type:</label>
                      <p>{getSubType(selectedCostCentre.subCCType)}</p>

                    </div>
                    <div className='m-1 px-2 py-2'>
                      <label htmlFor="cctype" className="block text-sm font-medium text-gray-700">Cost Centre CCode:</label>
                      <p>{selectedCostCentre.ccNo}</p>

                    </div>
                    <div className='m-1 px-2 py-2'>
                      <label htmlFor="cctype" className="block text-sm font-medium text-gray-700">Cost Centre Name:</label>
                      <p>{selectedCostCentre.ccName}</p>

                    </div>
                    <div className='m-1 px-2 py-2'>
                      <label htmlFor="cctype" className="block text-sm font-medium text-gray-700">Location:</label>
                      <p>{getStateName(selectedCostCentre.location)}</p>

                    </div>







                  </div>
                  {
                    isPerforming() ? (
                      <>
                        <div className=' grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          <div className='m-1 px-2 py-2'>
                            <label htmlFor="incharge" className="block text-sm font-medium text-gray-700">Project Handling:</label>
                            {
                              selectedCostCentre.projectHandling.map((ph, index) => (

                                <>

                                  <div className='border px-1 py-1' key={index}>

                                    <p>Name:{ph.name}</p>
                                    <p>Designation:{ph.designation}</p>
                                    <p>Ph:{ph.phone}</p>
                                  </div>
                                </>
                              ))
                            }

                          </div>
                          <div className='m-1 px-2 py-2'>
                            <label htmlFor="incharge" className="block text-sm font-medium text-gray-700">Client Details:</label>
                            {
                              selectedCostCentre.client.map((client, index) => (

                                <>

                                  <div className='border px-1 py-1' key={index}>

                                    <p>Name:{client.name}</p>
                                    <p>Address:{client.address}</p>
                                    <p>Ph:{client.phone}</p>
                                  </div>
                                </>
                              ))
                            }

                          </div>
                          <div className='m-1 px-2 py-2'>
                            <label htmlFor="incharge" className="block text-sm font-medium text-gray-700">Client Contact:</label>
                            {
                              selectedCostCentre.contact.map((contact, index) => (

                                <>

                                  <div className='border px-1 py-1' key={index}>

                                    <p>Name:{contact.name}</p>
                                    <p>Designation:{contact.designation}</p>
                                    <p>Ph:{contact.phone}</p>
                                  </div>
                                </>
                              ))
                            }

                          </div>

                        </div>



                        <div className='gird grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          <div className='m-1 px-2 py-2'>
                            <label htmlFor="incharge" className="block text-sm font-medium text-gray-700">Final Offer Ref:</label>
                            {
                              selectedCostCentre.finalOfferRef.map((offer, index) => (

                                <>

                                  <div className='border px-1 py-1' key={index}>

                                    <p>Reference:{offer.finalOfferRef}</p>
                                    <p>Date:{new Date(offer.finalOfferDate).toLocaleDateString()}</p>

                                  </div>
                                </>
                              ))
                            }

                          </div>
                          <div className='m-1 px-2 py-2'>
                            <label htmlFor="incharge" className="block text-sm font-medium text-gray-700">Final Acceptance Ref:</label>
                            {
                              selectedCostCentre.finalAcceptanceRef.map((acceptance, index) => (

                                <>

                                  <div className='border px-1 py-1' key={index}>

                                    <p>Reference:{acceptance.finalAcceptanceRef}</p>
                                    <p>Date:{new Date(acceptance.finalAcceptanceDate).toLocaleDateString()}</p>

                                  </div>
                                </>
                              ))
                            }
                          </div>

                        </div>

                      </>
                    ) : (
                      <>
                        <div className='m-1 px-2 py-2'>
                          <label htmlFor="address" className='block text-sm font-medium text-gray-700'>Address</label>
                          <p>{selectedCostCentre.address}</p>

                        </div>
                      </>
                    )
                  }
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' >
                    <div className='m-1 px-2 py-2'>
                      <p><span className=' font-bold text-gray-800'>Cash single Voucher Limit:</span> {selectedCostCentre.voucherLimit}</p>

                    </div>
                    <div className='m-1 px-2 py-2'>
                      <p><span className=' font-bold text-gray-800'>Cash Voucher Day Limit:</span> {selectedCostCentre.dayLimit}</p>

                    </div>

                  </div>



                  <div className='flex justify-end'>
                    <button className={`mr-4 font-bold py-2 px-4 rounded ${rejectCountdown !== null ?
                        'bg-red-500 hover:bg-red-700 text-white' : ' bg-gray-300 hover:bg-gray-400 text-gray-700'
                      }`}
                      onClick={handleRejectClick}
                      disabled={isRejecting}
                    >{rejectCountdown !== null ? `Cancel Reject(${rejectCountdown})` : 'Reject'}</button>
                    <button
                      className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded'
                      onClick={handleConfirm}

                    >
                      Confirm
                    </button>

                  </div>

                </div>

              </div>

            )
          }
          {
            success && (
              <Success
                onClose={onClose}
              />
            )
          }




        </div>
      )}
    </>
  )
}

export default VerifyNewCC
