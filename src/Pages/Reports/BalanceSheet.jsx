import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchBalanceSheet, resetBalanceSheet } from '../../Slices/reportsSlices';
import { CiCircleChevDown, CiCircleChevRight } from "react-icons/ci";
import { FaFilePdf } from "react-icons/fa";
import {usePDF} from 'react-to-pdf'

function BalanceSheet() {

  const dispatch = useDispatch();
  const { balanceSheet, loading, error } = useSelector(state => state.reports)
  const [expandedGroups, setExpandedGroups] = useState({});
  const [fiscalYearOption, setFiscalYearOption] = useState([])
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('')

  const { toPDF, targetRef } = usePDF({filename: `balance_sheet_${selectedFiscalYear}.pdf`});


  useEffect(() => {
    loadFiscalYearOptions()
  }, [])



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

  const loadFiscalYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 5 }, (_, i) => `${currentYear + i - 4}-${currentYear + i - 3}`)
    setFiscalYearOption(years)
    setSelectedFiscalYear(years[4])
  }

  const handleFiscalYearChange = (e) => {
    setSelectedFiscalYear(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(fetchBalanceSheet(selectedFiscalYear))
  }

  const handleReset = () => {
    dispatch(resetBalanceSheet())
    setSelectedFiscalYear(fiscalYearOption[4])
  }


  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const renderTreeItem = (item, depth = 0) => {
    const hasChildren = item.subgroups?.length > 0 || item.ledgers?.length > 0;
    const isExpanded = expandedGroups[item.groupId]

    return (
      <div key={item.groupId || item.ledgerId} className="w-full">
        <div
          className={`flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer ${depth === 0 ? 'font-bold' : ''}`}
          style={{ paddingLeft: `${depth * 20}px` }}
          onClick={() => hasChildren && toggleGroup(item.groupId)}
        >
          <div className="flex items-center">
            {hasChildren && (
              isExpanded ? <CiCircleChevDown size={16} /> : <CiCircleChevRight size={16} />
            )}
            <span className="ml-2">{item.groupName || item.ledgerName}</span>
          </div>
          <span>{item.amount?.toFixed(2) || '0.00'}</span>
        </div>
        {isExpanded && (
          <div>
            {item.subgroups?.map(subgroup => renderTreeItem(subgroup, depth + 1))}
            {item.ledgers?.map(ledger => renderTreeItem(ledger, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  const renderSection = (title, items, total) => (
    <div className="mb-4">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <div className='border-t border-b border-gray-300'>
        {items.map(item => renderTreeItem(item))}

      </div>

      <div className="flex justify-between font-bold p-2 ">
        <span>Total {title}</span>
        <span>{total?.toFixed(2) || '0.00'}</span>
      </div>
    </div>
  );

  if (loading) return <div className="text-center p-8">Loading balance sheet data...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">BALANCE SHEET</h1>
          <button 
            onClick={()=>toPDF()}
            className="flex items-center bg-red-400 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <FaFilePdf className="mr-2" />
            Export to PDF
          </button>
        </div>
        <form onSubmit={handleSubmit} className='mb-6'>
          <div className='flex items-center justify-start'>
            <select
              value={selectedFiscalYear}
              onChange={handleFiscalYearChange}
              className='mr-2 p-2 border rounded'
            >
              {fiscalYearOption.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className='flex gap-2'>
              <button type='submit' className='bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors'>
                Submit
              </button>
              <button type='button' onClick={handleReset} className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors'>
                Reset
              </button>
            </div>
          </div>
        </form>
        {balanceSheet && (
          <div ref={targetRef} id="balance-sheet-report" className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-center">Balance Sheet</h2>
              <p className="text-center text-gray-600">As of {balanceSheet.fiscalYear}</p>
              <p className="text-center text-sm text-gray-500">(Amounts in INR)</p>
            </div>
            <div className='grid grid-cols-2 gap-8 p-6'>
              <div>
                {renderSection("I. EQUITY AND LIABILITIES", balanceSheet.liabilities, balanceSheet.totalLiabilities)}
              </div>
              <div>
                {renderSection("II. ASSETS", balanceSheet.assets, balanceSheet.totalAssets)}
              </div>
            </div>
            <div className="bg-gray-100 p-6">
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL OF EQUITY AND LIABILITIES</span>
                <span>{formatCurrency(balanceSheet.totalLiabilities || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>TOTAL OF ASSETS</span>
                <span>{formatCurrency(balanceSheet.totalAssets || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}

export default BalanceSheet
