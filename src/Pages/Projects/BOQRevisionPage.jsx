// pages/BOQRevision/index.jsx

import React, { useEffect, useState } from 'react';
import RevisionList from '../Projects/RevisionList';
import RevisionDetail from '../Projects/RevisionDetails';
import { resetUpdateSuccess } from '../../Slices/boqRevisionSlices';
import { useDispatch, useSelector } from 'react-redux';

const BOQRevisionPage = () => {

    const dispatch = useDispatch();
    const [selectedBOQ, setSelectedBOQ] = useState(null);
    const { updateSuccess } = useSelector(state => state.boqRevision);

    useEffect(() => {
        return () => {
            dispatch(resetUpdateSuccess());
        };
    }, [dispatch]);
    useEffect(() => {
        if (updateSuccess) {
            setSelectedBOQ(null);
            dispatch(resetUpdateSuccess());
        }
    }, [updateSuccess, dispatch]);

    useEffect(() => {
        console.log('Selected BOQ state:', selectedBOQ);
    }, [selectedBOQ]);

    console.log('Rendering BOQRevisionPage, selectedBOQ exists:', !!selectedBOQ);

    const handleSelectBOQ = (boq) => {
        console.log('handleSelectBOQ called with:', boq?._id);
        setSelectedBOQ(boq);
    };

    const handleBack = () => {
        setSelectedBOQ(null);
        dispatch(resetUpdateSuccess());
    };


    if (selectedBOQ) {
        return (
            <div className="container mx-auto px-4">
                <RevisionDetail 
                    boq={selectedBOQ} 
                    onBack={handleBack} 
                />
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4">
        <RevisionList onSelectBOQ={handleSelectBOQ} />
    </div>
    );
};

export default BOQRevisionPage;