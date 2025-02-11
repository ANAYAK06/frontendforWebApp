// pages/ClientBOQ/index.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ClientBOQList from './ClientBOQList';
import BOQUploadMapping from './BOQUploadMapping';
import BOQPreviewExport from './BOQPreviewExport';
import { resetFinalCreateSuccess } from '../../Slices/projectModuleSlices/clientFinalBoqSlices';

const ClientBOQPage = () => {
    const dispatch = useDispatch();
    const [selectedBOQ, setSelectedBOQ] = useState(null);
    const [step, setStep] = useState('list'); // 'list', 'mapping', 'preview'
    const [mappedData, setMappedData] = useState(null);
    const [mergedData, setMergedData] = useState(null);
    const [originalWorkbook, setOriginalWorkbook] = useState(null);

    useEffect(() => {
        return () => {
            dispatch(resetFinalCreateSuccess());
        };
    }, [dispatch]);

    const handleBack = () => {
        switch(step) {
            case 'preview':
                setStep('list');
                break;
            case 'mapping':
                setStep('list');
                setSelectedBOQ(null);
                break;
            default:
                break;
        }
    };

    const handleMappingComplete = (mapped, merged, workbook) => {
        setMappedData(mapped);
        setMergedData(merged);
        setOriginalWorkbook(workbook);
        setStep('preview');
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container mx-auto px-4">
                {step === 'list' && (
                    <ClientBOQList 
                        onSelectBOQ={(boq) => {
                            setSelectedBOQ(boq);
                            setStep('mapping');
                        }} 
                    />
                )}
                
                {step === 'mapping' && (
                    <BOQUploadMapping
                        boq={selectedBOQ}
                        onBack={handleBack}
                        onMappingComplete={handleMappingComplete}
                    />
                )}

                {step === 'preview' && (
                    <BOQPreviewExport
                        boq={selectedBOQ}
                        mergedData={mergedData}
                        originalWorkbook={originalWorkbook}
                        onBack={handleBack}
                    />
                )}
            </div>
        </DndProvider>
    );
};

export default ClientBOQPage;