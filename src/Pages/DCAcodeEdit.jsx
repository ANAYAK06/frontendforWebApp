import React, { useEffect, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { TbSubtask } from "react-icons/tb";
import axios from 'axios'

function DCAcodeEdit() {

  const [rowData, setRowData] = useState([])
  const [isPopuOpen, setIsPopupOpen] = useState(false)
  const [subDCAData, setSubDCAData] = useState({ dcaCode: '', subdcaName: '' })
  const [subdcaNameInput, setSubdcaNameInput] = useState('')
  


  const clickToCreateSubDCA = (data) => {
    setSubDCAData({ ...subDCAData, dcaCode: data.code })
    setIsPopupOpen(true)
  }

  const handleInputChange = (e) => {
    setSubdcaNameInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('api/budgetdca/createsubdca',{
        dcaCode:subDCAData.dcaCode,
        subdcaName:subdcaNameInput
      })
      console.log('SubDCA Created', response.data);
      setIsPopupOpen(false)
      setSubdcaNameInput('')

    } catch (error) {
      console.error('Error creating SubDCA:', error);

    }
  }


  useEffect(() => {
    fetchDCACodes()
  },[])
  const fetchDCACodes = async () => {
    try {
      const response = await axios.get('api/budgetdca/getdcacodes')
      setRowData(response.data)
    } catch (error) {
      console.error('Error fetching DCA codes:', error);

    }
  }






  const columnDefs = [
    { headerName: "DCA Code", field: "code", sortable: true, filter: true, width: 200 },
    { headerName: "DCA Name", field: "name", sortable: true, filter: true, width: 250 },

    {
      headerName: "Actions",
      cellRenderer: params => <button className=' flex justify-center text-center  max-w-fit mx-2 border rounded-full text-2xl border-indigo-600 px-1 py-1 items-center  hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700 text-indigo-800 hover:text-white'  onClick={(e)=>{
        e.stopPropagation();
        clickToCreateSubDCA(params.data)
      }} title='CREATE SUBDCA'><TbSubtask /></button>,
      sortable: false,
      filter: false,
      width: 100,

    }


  ]


  return (
    <div>
      <div className="ag-theme-alpine mt-5" style={{
        height: 600, width: '100%',
        '--ag-header-background-color': '#3f03ad',
        '--ag-header-foreground-color': '#ffffff',
      }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSize={20}
          defaultColDef={{
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
            resizable: true,
          }}
          animateRows={true}
        />
      </div>
      {
        isPopuOpen && (
          <div className={` fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10`}>
            <div className='bg-white rounded-lg p-8 max-w-md w-full fade-in'>
              <h2 className='text-lg font-semibold mb-4'>Create Sub DCA</h2>
              <form onSubmit={handleSubmit}>
                <div className=' text-center justify-center'>
                  <h3 className='text-sm font-medium text-gray-700'> DCA CODE: <span className='text-sm font-medium text-green-800'>{subDCAData.dcaCode}</span></h3>
                  <h3 className='text-sm font-medium text-gray-700'>DCA NAME: <span className='text-sm font-medium text-green-800'>{rowData.find(dca=>dca.code===subDCAData.dcaCode)?.name}</span></h3>
            

                </div>
                <div className='mb-4'>
                  <label htmlFor="subdcaName" className='block text-sm font-medium text-gray-700'>SUB DCA NAME</label>
                  <input type="text"
                    id='subdcaName'
                    value={subdcaNameInput}
                    onChange={handleInputChange}
                    className='mt-1 p-2 block w-full border border-gray-300 rounded-md' />

                </div>

                <div className='flex justify-end'>
                  <button className='mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'

                   onClick={()=>setIsPopupOpen(false)}>Cancel</button>
                  <button
                    className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded'

                  >
                    Submit
                  </button>

                </div>
              </form>

            </div>

          </div>
        )
      }

    </div>
  )
}

export default DCAcodeEdit
