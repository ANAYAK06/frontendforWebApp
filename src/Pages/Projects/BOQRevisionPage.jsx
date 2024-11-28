// pages/BOQRevision/index.jsx

import React, { useState } from 'react';
import RevisionList from '../Projects/RevisionList';
import RevisionDetail from '../Projects/RevisionDetails';

const BOQRevisionPage = () => {
    const [selectedBOQ, setSelectedBOQ] = useState(null);

    return (
        <div className="container mx-auto px-4">
            {selectedBOQ ? (
                <RevisionDetail 
                    boq={selectedBOQ} 
                    onBack={() => setSelectedBOQ(null)} 
                />
            ) : (
                <RevisionList 
                    onSelectBOQ={setSelectedBOQ} 
                />
            )}
        </div>
    );
};

export default BOQRevisionPage;