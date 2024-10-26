import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronDown, FaRegEdit, FaTimes, FaUser, FaBuilding, FaPhone, FaFileAlt, FaCalendar, FaMoneyBillWave } from "react-icons/fa";
import {
    fetchVerificationCostCentres,
    updateCostCentre,
    rejectCostCentreThunk,
    resetUpdateSuccess,
    resetRejectSuccess
} from '../Slices/costCentreSlices';
import { fetchStates } from '../Slices/stateSlices';
import { fetchCostCentreTypes } from '../Slices/costCentreTypeSlices';
import { showToast } from '../utilities/toastUtilities';
import SignatureAndRemarks from '../Components/SignatureAndRemarks';

const defaultProps = {
    
    onStateChange: () => {}
};

function VerifyNewCC(props) {

    const {  onStateChange } = { ...defaultProps, ...props };

    const dispatch = useDispatch();
    const userRoleId = useSelector(state => state.auth.userInfo.roleId);
    const { ccstate } = useSelector((state) => state.ccstate);
    const costCentreTypes = useSelector((state) => state.costCentreTypes.costCentreTypes);
    const {
        costCentresForVerification,
        loading,
        error,
        updateSuccess,
        rejectSuccess
    } = useSelector((state) => state.costCentres);

    const [inboxExpanded, setInboxExpanded] = useState(false);
    const [selectedCostCentre, setSelectedCostCentre] = useState(null);
    const [remarks, setRemarks] = useState('');

    const hasContent = useMemo(() => costCentresForVerification.length > 0, [costCentresForVerification]);

    const closeCostCentreDetails = useCallback(() => {
        setSelectedCostCentre(null);
        setRemarks('');
    }, []);
    useEffect(() => {
        dispatch(fetchStates());
        dispatch(fetchCostCentreTypes());
    }, [dispatch]);

    useEffect(() => {
        if (userRoleId) {
            dispatch(fetchVerificationCostCentres(userRoleId));
        }
    }, [dispatch, userRoleId]);

    useEffect(() => {
        onStateChange(loading, hasContent);
    }, [loading, hasContent, onStateChange]);

    useEffect(() => {
        if (updateSuccess) {
            showToast('success', 'Cost Centre verified successfully');
            closeCostCentreDetails();
            dispatch(fetchVerificationCostCentres(userRoleId));
            dispatch(resetUpdateSuccess());
        }
        if (rejectSuccess) {
            showToast('error', 'Cost Centre rejected successfully');
            closeCostCentreDetails();
            dispatch(fetchVerificationCostCentres(userRoleId));
            dispatch(resetRejectSuccess());
        }
    }, [updateSuccess, rejectSuccess, dispatch, userRoleId, closeCostCentreDetails]);

    const toggleInbox = useCallback(() => setInboxExpanded(prev => !prev), []);

    const openCostCentreDetails = useCallback((cc) => setSelectedCostCentre(cc), []);



    const handleVerify = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before verifying');
            return;
        }
        try {
            await dispatch(updateCostCentre({
                id: selectedCostCentre._id,
                updateData: { remarks }
            })).unwrap();
        } catch (error) {
            showToast('error', 'Failed to verify Cost Centre: ' + error.message);
        }
    }, [dispatch, selectedCostCentre, remarks]);

    const handleReject = useCallback(async () => {
        if (!remarks.trim()) {
            showToast('error', 'Please enter remarks before rejecting');
            return;
        }
        try {
            await dispatch(rejectCostCentreThunk({
                id: selectedCostCentre._id,
                remarks
            })).unwrap();
        } catch (error) {
            showToast('error', 'Failed to reject Cost Centre: ' + error.message);
        }
    }, [dispatch, selectedCostCentre, remarks]);

    const getStateName = useCallback((id) => {
        const state = ccstate[0]?.states.find((state) => state.code === id);
        return state ? state.name : id;
    }, [ccstate]);

    const getCostCentreTypeName = useCallback((id) => {
        const typeId = parseInt(id);
        const type = costCentreTypes.find((type) => type.value === typeId);
        return type ? type.label : `Unknown Type (${id})`;
    }, [costCentreTypes]);

    const getSubType = useCallback((subTypeId) => {
        for (const ccType of costCentreTypes) {
            const subType = ccType.subType.find(sub => sub.value === parseInt(subTypeId));
            if (subType) {
                return subType.label;
            }
        }
        return `Unknown Sub-Type (${subTypeId})`;
    }, [costCentreTypes]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return null
    if (!hasContent) return null;

    return (
        <div className='w-full bg-white shadow-md rounded-md overflow-hidden mb-4 mt-4'>
            <div className='p-4 bg-slate-100 flex justify-between items-center'>
                <div className='px-2 py-2 rounded-full bg-slate-300 cursor-pointer' onClick={toggleInbox}>
                    <FaChevronDown className={`text-gray-600 font-bold ${inboxExpanded ? 'rotate-180 duration-300' : ''}`} />
                </div>
                <div><h3 className='text-gray-600 font-bold'>New Cost Centre</h3></div>
                <div className='font-bold text-red-500'>({costCentresForVerification.length})</div>
            </div>

            <div className={`transition-max-height duration-500 ease-in-out overflow-hidden ${inboxExpanded ? 'max-h-screen' : 'max-h-0'}`}>
                {inboxExpanded && (
                    <div className='p-4 bg-white'>
                        <div className='overflow-x-auto'>
                            <table className='min-w-full'>
                                <thead className='text-gray-700'>
                                    <tr>
                                        <th className='border px-4 py-2'>Action</th>
                                        <th className='border px-4 py-2'>CC No</th>
                                        <th className='border px-4 py-2'>Name</th>
                                        <th className='border px-4 py-2'>Type</th>
                                        <th className='border px-4 py-2'>Location</th>
                                    </tr>
                                </thead>
                                <tbody className='item-centre justify-center'>
                                    {costCentresForVerification.map((cc) => (
                                        <tr key={cc._id}>
                                            <td className='border px-4 py-2'>
                                                <FaRegEdit
                                                    className='text-yellow-600 cursor-pointer text-2xl'
                                                    onClick={() => openCostCentreDetails(cc)}
                                                />
                                            </td>
                                            <td className='border px-4 py-2'>{cc.ccNo}</td>
                                            <td className='border px-4 py-2'>{cc.ccName}</td>
                                            <td className='border px-4 py-2'>{getCostCentreTypeName(cc.ccType)}</td>
                                            <td className='border px-4 py-2'>{getStateName(cc.location)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {selectedCostCentre && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-start justify-center z-30">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white fade-in">
                        <div className='absolute top-0 right-0 mt-4 mr-4  '>
                            <button onClick={closeCostCentreDetails} className='text-gray-400 hover:text-gray-500'>
                                <FaTimes className="h-6 w-6 hover:border rounded-full hover:text-red-400" />
                            </button>
                        </div>
                        <div className="mt-3">
                            <div className='bg-gray-100 text-gray-800 px-6 py-4 rounded-t-md'>
                                <h3 className='text-2xl font-bold leading-tight'>{selectedCostCentre.ccName} ({selectedCostCentre.ccNo})</h3>
                                <p className='text-lg mt-1 font-medium text-indigo-700'>
                                    {getCostCentreTypeName(selectedCostCentre.ccType)} - {getSubType(selectedCostCentre.subCCType)}
                                </p>
                            </div>

                            <div className="mt-4 px-6 py-4 space-y-4">
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='bg-indigo-50 p-4 rounded-md'>
                                        <h4 className='text-lg font-semibold text-indigo-700 mb-2'>Project Handling</h4>
                                        {selectedCostCentre.projectHandling.map((person, index) => (
                                            <div key={index} className="mb-2">
                                                <p><FaUser className="inline mr-2" />{person.name}</p>
                                                <p><FaBuilding className="inline mr-2" />{person.designation}</p>
                                                <p><FaPhone className="inline mr-2" />{person.phone}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='bg-green-50 p-4 rounded-md'>
                                        <h4 className='text-lg font-semibold text-green-700 mb-2'>Client Details</h4>
                                        {selectedCostCentre.client.map((client, index) => (
                                            <div key={index} className="mb-2">
                                                <p><FaBuilding className="inline mr-2" />{client.name}</p>
                                                <p><FaUser className="inline mr-2" />{client.address}</p>
                                                <p><FaPhone className="inline mr-2" />{client.phone}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 mt-4'>
                                    <div className='bg-purple-50 p-4 rounded-md'>
                                        <h4 className='text-lg font-semibold text-purple-700 mb-2'>Final Offer</h4>
                                        {selectedCostCentre.finalOfferRef.map((offer, index) => (
                                            <div key={index} className="mb-2">
                                                <p><FaFileAlt className="inline mr-2" />{offer.finalOfferRef}</p>
                                                <p><FaCalendar className="inline mr-2" />{formatDate(offer.finalOfferDate)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='bg-yellow-50 p-4 rounded-md'>
                                        <h4 className='text-lg font-semibold text-yellow-700 mb-2'>Final Acceptance</h4>
                                        {selectedCostCentre.finalAcceptanceRef.map((acceptance, index) => (
                                            <div key={index} className="mb-2">
                                                <p><FaFileAlt className="inline mr-2" />{acceptance.finalAcceptanceRef}</p>
                                                <p><FaCalendar className="inline mr-2" />{formatDate(acceptance.finalAcceptanceDate)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 mt-4'>
                                    <div className='bg-red-50 p-4 rounded-md'>
                                        <h4 className='text-lg font-semibold text-red-700 mb-2'>Limits</h4>
                                        <p><FaMoneyBillWave className="inline mr-2" />Day Limit: {selectedCostCentre.dayLimit}</p>
                                        <p><FaMoneyBillWave className="inline mr-2" />Voucher Limit: {selectedCostCentre.voucherLimit}</p>
                                    </div>
                                    <div className='bg-indigo-50 p-4 rounded-md'>
                                        <h4 className='text-lg font-semibold text-indigo-700 mb-2'>Contact</h4>
                                        {selectedCostCentre.contact && selectedCostCentre.contact.length > 0 ? (
                                            selectedCostCentre.contact.map((person, index) => (
                                                <div key={index} className="mb-2">
                                                    <p><FaUser className="inline mr-2" />{person.name}</p>
                                                    <p><FaBuilding className="inline mr-2" />{person.designation}</p>
                                                    <p><FaPhone className="inline mr-2" />{person.phone}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No contact information available</p>
                                        )}
                                    </div>
                                </div>

                                <SignatureAndRemarks
                                    signatures={Array.isArray(selectedCostCentre.signatureAndRemarks) ? selectedCostCentre.signatureAndRemarks : []}
                                />

                                <div className="mt-4">
                                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>
                                    <textarea
                                        id="remarks"
                                        name="remarks"
                                        rows="3"
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                        placeholder="Enter your remarks here"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6 px-6">
                                <button
                                    className="px-6 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    onClick={handleVerify}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Verify'}
                                </button>
                                <button
                                    className="px-6 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    onClick={handleReject}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default React.memo(VerifyNewCC);