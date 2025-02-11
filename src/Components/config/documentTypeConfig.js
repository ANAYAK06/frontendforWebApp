// config/documentTypesConfig.js

 const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return `₹${Number(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })}`;
  };
  
 const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
 export const documentTypes = {
    'boq': {
      patterns: ['boq', 'tender', 'offer', 'quotation', 'bid'],
      identifiers: ['offer number', 'tender number', 'opportunity number'],
      responseFormatter: (status) => {
        const formattedStatus = {
          status: status.status || 'Pending',
          referenceId: status.referenceId || '',
          amount: formatCurrency(status.amount),
          client: status.client || 'N/A'
        };
        
        return [
          `BOQ Status: ${formattedStatus.status}`,
          `Reference: ${formattedStatus.referenceId}`,
          `Amount: ${formattedStatus.amount}`,
          `Client: ${formattedStatus.client}`
        ].join('\n');
      },
      detailsFormatter: (details) => ({
        'Document Info': {
          'Status': details.status || 'Pending',
          'Reference ID': details.referenceId || 'N/A',
          'BOQ Status': details.boqStatus || 'N/A'
        },
        'Financial Details': {
          'Amount': formatCurrency(details.amount),
          'Original Amount': formatCurrency(details.originalAmount),
          'Variation Acceptance': `${details.variationAcceptance || 0}%`
        },
        'Client Details': {
          'Client': details.client || 'N/A',
          'Tender Number': details.tenderNumber || 'N/A',
          'Opportunity Number': details.opportunityNumber || 'N/A'
        },
        'Project Info': {
          'Business Category': details.businessCategory || 'N/A',
          'Work Description': details.workDescription || 'N/A',
          'Total Items': details.totalItems || 0
        },
        'Workflow Status': {
          'Current Level': details.level || 1,
          'Current Role': details.currentRole || 'Pending Review',
          'Last Updated': formatDate(details.lastUpdated),
          'Last Updated By': details.lastUpdatedBy || 'N/A',
          'Progress': `${details.workflow?.percentage || 0}% Complete`,
          'Steps': `${details.workflow?.completedSteps || 0}/${details.workflow?.totalSteps || 0} Steps`
        }
      })
    },
    'supplierPO': {
      patterns: ['supplier po', 'purchase order', 'vendor po', 'po number'],
      identifiers: ['po number'],
      responseFormatter: (status) => {
        const formattedStatus = {
          status: status.status || 'Pending',
          referenceId: status.referenceId || '',
          amount: formatCurrency(status.amount),
          supplier: status.supplier || 'N/A'
        };
        
        return [
          `PO Status: ${formattedStatus.status}`,
          `Reference: ${formattedStatus.referenceId}`,
          `Amount: ${formattedStatus.amount}`,
          `Supplier: ${formattedStatus.supplier}`
        ].join('\n');
      },
      detailsFormatter: (details) => ({
        // Similar structure as BOQ but with PO-specific fields
        // Add PO specific grouping and fields here
      })
    },
    // Add other document types here
  };
  
  export const getDocumentTypeByPattern = (text) => {
    const lowercaseText = text.toLowerCase();
    return Object.entries(documentTypes).find(([type, config]) => 
      config.patterns.some(pattern => lowercaseText.includes(pattern))
    )?.[0];
  };
  export const getDocumentTypeByIdentifier = (text) => {
    const lowercaseText = text.toLowerCase();
    return Object.entries(documentTypes).find(([type, config]) => 
      config.identifiers.some(identifier => lowercaseText.includes(identifier))
    )?.[0];
  };  
 


 
