import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfitAndLoss, resetProfitAndLoss } from '../../Slices/reportsSlices';
import { CiCircleChevDown, CiCircleChevRight } from "react-icons/ci";
import { FaFilePdf } from "react-icons/fa";
import { usePDF } from 'react-to-pdf'

function ProfitAndLoss() {
    const dispatch = useDispatch();
    const { loadingPL, errorPL , profitAndLoss} = useSelector(state => state.reports)
    const [expandedGroups, setExpandedGroups] = useState({});
    const [fiscalYearOption, setFiscalYearOption] = useState([])
    const [selectedFiscalYear, setSelectedFiscalYear] = useState('')

    const { toPDF, targetRef } = usePDF({filename: `profit_and_loss_${selectedFiscalYear}.pdf`});

    useEffect(() => {
        loadFiscalYearOptions()
    }, [])

    useEffect(() => {
        if (profitAndLoss) {
            console.log('Profit and Loss data received:', profitAndLoss);
        }
    }, [profitAndLoss]);

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
        e.preventDefault();
        console.log('Submitting request for fiscal year:', selectedFiscalYear);
        dispatch(fetchProfitAndLoss(selectedFiscalYear))
            .unwrap()
            .then((result) => {
                console.log('Fetch Profit and Loss successful:', result);
            })
            .catch((error) => {
                console.error('Error fetching Profit and Loss:', error);
            });
    };


    const handleReset = () => {
        dispatch(resetProfitAndLoss())
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
                    <span>{formatCurrency(item.amount || 0)}</span>
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
                <span>{formatCurrency(total || 0)}</span>
            </div>
        </div>
    );

    if (loadingPL) return <div className="text-center p-8">Loading profit and loss data...</div>;
    if (errorPL) return <div className="text-center p-8 text-red-600">Error: {errorPL}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">PROFIT AND LOSS</h1>
                    <button 
                        onClick={() => toPDF()}
                        className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
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
                {profitAndLoss ? (
                <div ref={targetRef} className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className="text-2xl font-semibold text-center">Profit and Loss Statement</h2>
                        <p className="text-center text-gray-600">For the Year Ended {profitAndLoss.fiscalYear}</p>
                        <p className="text-center text-sm text-gray-500">(Amounts in INR)</p>
                    </div>
                    <div className='p-6'>
                        {renderSection("Revenue", profitAndLoss.revenue, profitAndLoss.totalRevenue)}
                        {renderSection("Cost of Goods Sold", profitAndLoss.costOfGoodsSold, profitAndLoss.totalCostOfGoodsSold)}
                        <div className="flex justify-between font-bold p-2 bg-gray-100">
                            <span>Gross Profit</span>
                            <span>{formatCurrency(profitAndLoss.grossProfit)}</span>
                        </div>
                        {renderSection("Other Income", profitAndLoss.otherIncome, profitAndLoss.totalOtherIncome)}
                        {renderSection("Expenses", profitAndLoss.expenses, profitAndLoss.totalExpenses)}
                        <div className="flex justify-between font-bold p-2 bg-gray-200 text-lg">
                            <span>Net Profit</span>
                            <span>{formatCurrency(profitAndLoss.netProfit)}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8">No profit and loss data available. Please select a fiscal year and submit.</div>
            )}
            </div>
        </div>
    )
}

export default ProfitAndLoss