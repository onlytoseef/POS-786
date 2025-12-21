import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import toast from 'react-hot-toast';
import { PageSkeleton } from '../components/ui/Skeleton';
import { FaBook, FaEye } from 'react-icons/fa';
import { exportToPDF } from '../utils/pdfExport';

interface CustomerLedger {
    id: number;
    name: string;
    phone: string;
    total_invoices: number;
    total_purchase: number;
    total_cash: number;
    total_credit: number;
    total_paid: number;
    balance: number;
}

const GeneralLedger = () => {
    const [customers, setCustomers] = useState<CustomerLedger[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const res = await api.get('/ledger/customers');
            setCustomers(res.data);
        } catch (err: any) {
            toast.error('Failed to load ledger data');
            console.error(err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewDetails = (customerId: number) => {
        navigate(`/ledger/customer/${customerId}`);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const handleExportPDF = () => {
        const pdfColumns = [
            { header: 'Customer', accessor: 'name' },
            { header: 'Phone', accessor: 'phone' },
            { header: 'Invoices', accessor: 'total_invoices' },
            { header: 'Total Purchase', accessor: 'total_purchase' },
            { header: 'Cash', accessor: 'total_cash' },
            { header: 'Credit', accessor: 'total_credit' },
            { header: 'Paid', accessor: 'total_paid' },
            { header: 'Balance', accessor: 'balance' }
        ];
        const data = filteredCustomers.map(c => ({
            name: c.name,
            phone: c.phone || '-',
            total_invoices: c.total_invoices.toString(),
            total_purchase: `Rs. ${Number(c.total_purchase).toLocaleString()}`,
            total_cash: `Rs. ${Number(c.total_cash).toLocaleString()}`,
            total_credit: `Rs. ${Number(c.total_credit).toLocaleString()}`,
            total_paid: `Rs. ${Number(c.total_paid).toLocaleString()}`,
            balance: `Rs. ${Number(c.balance).toLocaleString()}`
        }));
        exportToPDF({
            title: 'General Ledger - Customer Summary',
            columns: pdfColumns,
            data,
            filename: `general-ledger-${new Date().toISOString().split('T')[0]}.pdf`
        });
    };

    const columns = [
        { header: 'Customer', accessor: 'name' as keyof CustomerLedger },
        { header: 'Phone', accessor: (item: CustomerLedger) => item.phone || '-' },
        { header: 'Invoices', accessor: 'total_invoices' as keyof CustomerLedger },
        { 
            header: 'Total Purchase', 
            accessor: (item: CustomerLedger) => `Rs. ${Number(item.total_purchase).toLocaleString()}` 
        },
        { 
            header: 'Cash Purchases', 
            accessor: (item: CustomerLedger) => (
                <span style={{ color: '#065F46' }}>
                    Rs. {Number(item.total_cash).toLocaleString()}
                </span>
            )
        },
        { 
            header: 'Credit Purchases', 
            accessor: (item: CustomerLedger) => (
                <span style={{ color: '#B45309' }}>
                    Rs. {Number(item.total_credit).toLocaleString()}
                </span>
            )
        },
        { 
            header: 'Total Paid', 
            accessor: (item: CustomerLedger) => (
                <span style={{ color: '#059669' }}>
                    Rs. {Number(item.total_paid).toLocaleString()}
                </span>
            )
        },
        { 
            header: 'Balance', 
            accessor: (item: CustomerLedger) => (
                <span style={{ 
                    color: Number(item.balance) > 0 ? '#DC2626' : '#059669',
                    fontWeight: 'bold'
                }}>
                    Rs. {Number(item.balance).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item: CustomerLedger) => (
                <button
                    onClick={() => handleViewDetails(item.id)}
                    className="px-3 py-1 rounded text-white flex items-center gap-1"
                    style={{ backgroundColor: '#242A2A' }}
                >
                    <FaEye /> View
                </button>
            )
        }
    ];

    // Calculate totals
    const totals = filteredCustomers.reduce((acc, c) => ({
        total_purchase: acc.total_purchase + Number(c.total_purchase),
        total_cash: acc.total_cash + Number(c.total_cash),
        total_credit: acc.total_credit + Number(c.total_credit),
        total_paid: acc.total_paid + Number(c.total_paid),
        balance: acc.balance + Number(c.balance),
    }), { total_purchase: 0, total_cash: 0, total_credit: 0, total_paid: 0, balance: 0 });

    if (pageLoading) {
        return <PageSkeleton rows={6} />;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#242A2A' }}>
                        <FaBook className="inline mr-2" />
                        General Ledger
                    </h1>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>
                        View all customer accounts and ledger summaries
                    </p>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                    style={{ backgroundColor: '#242A2A' }}
                >
                    Export PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="p-4 rounded-lg shadow" style={{ backgroundColor: '#EBE0C0' }}>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Total Purchase</p>
                    <p className="text-lg font-bold" style={{ color: '#242A2A' }}>
                        Rs. {totals.total_purchase.toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow bg-green-50">
                    <p className="text-xs" style={{ color: '#6B7280' }}>Cash Purchases</p>
                    <p className="text-lg font-bold text-green-700">
                        Rs. {totals.total_cash.toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow bg-amber-50">
                    <p className="text-xs" style={{ color: '#6B7280' }}>Credit Purchases</p>
                    <p className="text-lg font-bold text-amber-700">
                        Rs. {totals.total_credit.toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow bg-emerald-50">
                    <p className="text-xs" style={{ color: '#6B7280' }}>Total Paid</p>
                    <p className="text-lg font-bold text-emerald-700">
                        Rs. {totals.total_paid.toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow" style={{ backgroundColor: totals.balance > 0 ? '#FEE2E2' : '#D1FAE5' }}>
                    <p className="text-xs" style={{ color: '#6B7280' }}>Total Balance</p>
                    <p className="text-lg font-bold" style={{ color: totals.balance > 0 ? '#DC2626' : '#059669' }}>
                        Rs. {totals.balance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by customer name, city, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB' }}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredCustomers}
            />
        </div>
    );
};

export default GeneralLedger;
