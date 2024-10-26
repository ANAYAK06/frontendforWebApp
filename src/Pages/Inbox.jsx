import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IoMailOpenOutline } from "react-icons/io5";
import VerifyNewCC from './VerifyNewCC';
import VerifyLedger from './Accounts/VerifyLedger';
import VerifyGroups from './Accounts/VerifyGroups';
import CCBudgetVerification from '../Components/CCBudgetVerification';
import VerifyDcaBudget from './VerifyDcaBudget';

// Base components - these work independently of CCID
const baseComponents = [
  { 
    Component: VerifyNewCC, 
    key: 'newCC',
  },
  { 
    Component: VerifyLedger, 
    key: 'ledgerVerification',
  },
  { 
    Component: VerifyGroups, 
    key: 'groupVerification',
  }
];

// Budget components - these depend on CCID
const budgetComponents = {
  performing: [
    { 
      Component: CCBudgetVerification, 
      key: 'performingCCBudget',
      props: { 
        budgetType: 'performing',
      }
    },
    { 
      Component: VerifyDcaBudget, 
      key: 'pccdcabudget',
      props: { 
        budgetType: 'performing',
      }
    }
  ],
  nonperforming: [
    { 
      Component: CCBudgetVerification, 
      key: 'npccBudget',
      props: { 
        budgetType: 'nonperforming',
      }
    },
    { 
      Component: VerifyDcaBudget, 
      key: 'npccdcabudget',
      props: { 
        budgetType: 'nonperforming',
      }
    }
  ],
  capital: [
    {
      Component: CCBudgetVerification,
      key: 'capitalCCBudget',
      props: { 
        budgetType: 'capital',
      }
    }
  ]
};

const CCID_TYPE_MAP = {
  100: 'capital',
  101: 'nonperforming',
  102: 'performing'
};

function Inbox() {
  const [baseComponentsToRender, setBaseComponentsToRender] = useState([]);
  const [budgetComponentsToRender, setBudgetComponentsToRender] = useState([]);
  const [componentStates, setComponentStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeBudgetType, setActiveBudgetType] = useState(null);

  // Handle CCID Found - Only affects budget components
  const handleCCIDFound = useCallback((ccid) => {
    const typeFromCCID = CCID_TYPE_MAP[ccid];
    
    if (!typeFromCCID || typeFromCCID === activeBudgetType) return;

    setActiveBudgetType(typeFromCCID);
    
    // Update only budget components based on CCID
    const newBudgetComponents = (budgetComponents[typeFromCCID] || []).map(comp => ({
      ...comp,
      key: `${comp.key}-${ccid}`,
      props: {
        ...comp.props,
        onCCIDFound: handleCCIDFound,
        ccid: ccid,
        budgetType:typeFromCCID,
        isInbox:true
        
      }
    }));

    setBudgetComponentsToRender(newBudgetComponents);
  }, [activeBudgetType]);

  // Handle component state changes
  const handleComponentState = useCallback((key, isLoading, hasContent) => {
    setComponentStates(prev => {
      const newState = { ...prev[key], isLoading, hasContent };
      if (JSON.stringify(prev[key]) !== JSON.stringify(newState)) {
        return { ...prev, [key]: newState };
      }
      return prev;
    });
  }, []);

  // Handle component removal
  const handleRemoveComponent = useCallback((keyToRemove) => {
    // Check if it's a budget component
    if (keyToRemove.includes('CCBudget') || keyToRemove.includes('dcabudget')) {
      setBudgetComponentsToRender(prev => 
        prev.filter(item => item.key !== keyToRemove)
      );
    } else {
      // Handle base component removal
      setBaseComponentsToRender(prev => 
        prev.filter(item => item.key !== keyToRemove)
      );
    }

    setComponentStates(prev => {
      const newState = { ...prev };
      delete newState[keyToRemove];
      return newState;
    });
  }, []);

  // Initialize components
  useEffect(() => {
    // Initialize base components - these remain constant
    const initialBaseComponents = baseComponents.map(comp => ({
      ...comp,
      key: `${comp.key}-${Date.now()}`,
    }));

    // Initialize with default budget component
    const initialBudgetComponent = [{
      Component: CCBudgetVerification,
      key: `initialCCBudget-${Date.now()}`,
      props: {
        budgetType: 'nonperforming',
        onCCIDFound: handleCCIDFound,
        isInbox:true
      }
    }];

    setBaseComponentsToRender(initialBaseComponents);
    setBudgetComponentsToRender(initialBudgetComponent);
    
    // Initialize states for all components
    const initialStates = [...initialBaseComponents, ...initialBudgetComponent]
      .reduce((acc, { key }) => {
        acc[key] = { isLoading: true, hasContent: false };
        return acc;
      }, {});
    
    setComponentStates(initialStates);
    setIsLoading(false);

    return () => {
      setBaseComponentsToRender([]);
      setBudgetComponentsToRender([]);
      setComponentStates({});
      setActiveBudgetType(null);
    };
  }, [handleCCIDFound]);

  // Compute derived states
  const hasAnyContent = useMemo(() =>
    Object.values(componentStates).some(state => state?.hasContent),
    [componentStates]
  );

  const isAnyComponentLoading = useMemo(() =>
    Object.values(componentStates).some(state => state?.isLoading),
    [componentStates]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Combine base and budget components for rendering
  const allComponents = [...baseComponentsToRender, ...budgetComponentsToRender];

  return (
    <div className='flex flex-col items-start justify-start min-h-screen w-full p-4 bg-zinc-300'>
      {!hasAnyContent && !isAnyComponentLoading ? (
        <div className='flex flex-col items-center justify-center w-full h-full'>
          <IoMailOpenOutline className='text-6xl text-gray-600' />
          <p className='mt-4 text-gray-500 font-semibold'>Your inbox is empty</p>
        </div>
      ) : (
        <div className='w-full max-w-4xl mx-auto space-y-2'>
          {allComponents.map(({ Component, key, props = {} }) => (
            <ErrorBoundary key={key} componentName={key}>
              <Component
                {...props}
                checkContent={true}
                onEmpty={() => handleRemoveComponent(key)}
                onStateChange={(isLoading, hasContent) => 
                  handleComponentState(key, isLoading, hasContent)
                }
              />
            </ErrorBoundary>
          ))}
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`Error in component ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export default Inbox;