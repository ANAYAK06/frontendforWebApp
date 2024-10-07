import React, { useEffect, useState }  from 'react'
import { IoMailOpenOutline } from "react-icons/io5";
import VerifyNewCC from './VerifyNewCC';
import VerifyPerformingCCBudget from './VerifyPerformingCCBudget';
import VerifyNPCCBudget from './VerifyNPCCBudget'
import VerifyPCCDcaBudget from './VerifyPCCDcaBudget'


const inboxComponents = [
  {
    Component:VerifyNewCC,
    key:'newCC'
  },
  {
    Component:VerifyPerformingCCBudget,
    key:'performingCCBudget'
  },
  {
    Component:VerifyNPCCBudget,
    key:'npccBudget'
  },
  {
    Component:VerifyPCCDcaBudget
  }
]

function Inbox() {
  const [renderedComponents, setRenderedComponents] = useState([]);

  useEffect(() => {
    const renderComponents = async () => {
      const components = await Promise.all(
        inboxComponents.map(async ({ Component, key }) => {
          const shouldRender = await new Promise(resolve => {
            const comp = <Component checkContent={true}/>

            resolve=(comp !==null)
          })
          return shouldRender ? {Component, key} :null
        })
      );
      setRenderedComponents(components.filter(Boolean));
    };

    renderComponents();
  }, []);


  




  return (
    <div className='flex flex-col items-start justify-start min-h-screen w-full p-4 bg-zinc-300'>
    {renderedComponents.length === 0 ? (
      <div className='flex flex-col items-center justify-center w-full h-full'>
        <IoMailOpenOutline className='text-6xl text-gray-600' />
        <p className='mt-4 text-gray-500 font-semibold'>Your inbox is empty</p>
      </div>
    ) : (
      <div className='w-full max-w-4xl mx-auto space-y-2'>
    {renderedComponents.map(({Component, key}) => (
      <Component key={key} />
    ))}
      </div>
    )}
  </div>










  )
}

export default Inbox
