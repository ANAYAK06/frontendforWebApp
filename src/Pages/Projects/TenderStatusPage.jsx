// pages/TenderStatus/index.jsx
import React, { useState, useEffect } from 'react';
import TenderStatusList from './TenderStatusList';
import TenderStatusDetail from './TenderStatusDetail';
import { resetTenderState, resetSuccess } from '../../Slices/tenderStatusSlices';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../utilities/toastUtilities';

const TenderStatusPage = () => {
    const dispatch = useDispatch();
    const [selectedBOQ, setSelectedBOQ] = useState(null);
    const { 
        createSuccess, 
        updateSuccess, 
        rejectSuccess,
        error,
        successMessage 
    } = useSelector(state => state.tenderStatus);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(resetTenderState());
        };
    }, [dispatch]);

    // Handle success states
    useEffect(() => {
        if (createSuccess || updateSuccess || rejectSuccess) {
            if (successMessage) {
                showToast('success', successMessage);
            }
            setSelectedBOQ(null);
            dispatch(resetSuccess());
        }
    }, [createSuccess, updateSuccess, rejectSuccess, successMessage, dispatch]);

    // Handle error state
    useEffect(() => {
        if (error) {
            showToast('error', error);
        }
    }, [error]);

    const handleSelectBOQ = (boq) => {
        setSelectedBOQ(boq);
    };

    const handleBack = () => {
        setSelectedBOQ(null);
        dispatch(resetSuccess());
    };

    if (selectedBOQ) {
        return (
            <div className="container mx-auto px-4">
                <TenderStatusDetail
                    boq={selectedBOQ}
                    onBack={handleBack}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <TenderStatusList onSelectBOQ={handleSelectBOQ} />
        </div>
    );
};

export default TenderStatusPage;