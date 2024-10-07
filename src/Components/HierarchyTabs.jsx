import React from 'react'

function HierarchyTabs({activeTab, setActiveTab, costCentreTypes, children}) {
  return (
    <div>
        <div className='flex border-b'>
            {
                costCentreTypes.map((type, index)=> (
                    <button
                    type='button'
                    key={type.id}
                    className={`py-2 px-4 mt-3 ${activeTab === index ? 'border-b-4  border-indigo-500 bg-indigo-100':'bg-gray-300 text-gray-600 border-r-2' }`}
                    onClick={()=> setActiveTab(index)}
                    >{type.label}</button>
                ))
            }

        </div>
        <div className='mt-4'>
            {React.Children.toArray(children)[activeTab]}

        </div>

      
    </div>
  )
}

export default HierarchyTabs
