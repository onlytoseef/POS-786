import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/ui/DataTable';
import toast from 'react-hot-toast';
import { PageSkeleton } from '../components/ui/Skeleton';
import { FaArrowLeft, FaUser, FaFileInvoice, FaMoneyBillWave } from 'react-icons/fa';
import { exportToPDF } from '../utils/pdfExport';

interface CustomerInfo {
    id: number;
    name: string;
    phone: string;
}

interface Invoice {
    id: number;
    invoice_number: string;
    date: string;
    type: string;
    total_amount: number;
    items_count: number;
}

interface Payment {
    id: number;
    amount: number;
    payment_type: string;
    reference: string;
    notes: string;
    created_at: string;
}

interface LedgerSummary {
    total_invoices: number;
    total_purchase: number;
    total_cash: number;
    total_credit: number;
    total_paid: number;
    balance: number;
}

const CustomerLedgerDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<CustomerInfo | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [summary, setSummary] = useState<LedgerSummary | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

    const fetchData = async () => {
        try {
            const res = await api.get(`/ledger/customer/${id}`);
            setCustomer(res.data.customer);
            setInvoices(res.data.invoices);
            setPayments(res.data.payments);
            setSummary(res.data.summary);
        } catch (err: any) {
            toast.error('Failed to load customer ledger');
            console.error(err);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const handleExportPDF = () => {
        if (!customer || !summary) return;

        const pdfColumns = [
            { header: 'Invoice #', accessor: 'invoice_number' },
            { header: 'Date', accessor: 'date' },
            { header: 'Type', accessor: 'type' },
            { header: 'Items', accessor: 'items_count' },
            { header: 'Amount', accessor: 'total_amount' }
        ];
        
        const data = invoices.map(inv => ({
            invoice_number: inv.invoice_number,
            date: new Date(inv.date).toLocaleDateString('en-PK'),
            type: inv.type,
            items_count: inv.items_count.toString(),
            total_amount: `Rs. ${Number(inv.total_amount).toLocaleString()}`
        }));

        // Add summary rows
        data.push({ invoice_number: '', date: '', type: '', items_count: '', total_amount: '' });
        data.push({ invoice_number: '', date: '', type: '', items_count: 'Total Purchase:', total_amount: `Rs. ${Number(summary.total_purchase).toLocaleString()}` });
        data.push({ invoice_number: '', date: '', type: '', items_count: 'Cash Purchases:', total_amount: `Rs. ${Number(summary.total_cash).toLocaleString()}` });
        data.push({ invoice_number: '', date: '', type: '', items_count: 'Credit Purchases:', total_amount: `Rs. ${Number(summary.total_credit).toLocaleString()}` });
        data.push({ invoice_number: '', date: '', type: '', items_count: 'Total Paid:', total_amount: `Rs. ${Number(summary.total_paid).toLocaleString()}` });
        data.push({ invoice_number: '', date: '', type: '', items_count: 'Balance:', total_amount: `Rs. ${Number(summary.balance).toLocaleString()}` });

        exportToPDF({
            title: `Customer Ledger - ${customer.name}`,
            columns: pdfColumns,
            data,
            filename: `customer-ledger-${customer.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
        });
    };

    const invoiceColumns = [
        { header: 'Invoice #', accessor: 'invoice_number' as keyof Invoice },
        { header: 'Date', accessor: (item: Invoice) => new Date(item.date).toLocaleDateString('en-PK') },
        { 
            header: 'Type', 
            accessor: (item: Invoice) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.type === 'cash' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                    {item.type}
                </span>
            )
        },
        { header: 'Items', accessor: 'items_count' as keyof Invoice },
        { 
            header: 'Amount', 
            accessor: (item: Invoice) => `Rs. ${Number(item.total_amount).toLocaleString()}` 
        },
    ];

    const paymentColumns = [
        { header: 'Date', accessor: (item: Payment) => new Date(item.created_at).toLocaleDateString('en-PK') },
        { 
            header: 'Type', 
            accessor: (item: Payment) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.payment_type === 'credit_voucher' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                    {item.payment_type === 'credit_voucher' ? 'Credit Voucher' : 'Cash Received'}
                </span>
            )
        },
        { 
            header: 'Amount', 
            accessor: (item: Payment) => (
                <span className="font-medium text-green-700">
                    Rs. {Number(item.amount).toLocaleString()}
                </span>
            )
        },
        { header: 'Reference', accessor: (item: Payment) => item.reference || '-' },
        { header: 'Notes', accessor: (item: Payment) => item.notes || '-' },
    ];

    if (pageLoading) {
        return <PageSkeleton rows={6} />;
    }

    if (!customer || !summary) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Customer not found</p>
                <button
                    onClick={() => navigate('/ledger')}
                    className="mt-4 px-4 py-2 rounded text-white"
                    style={{ backgroundColor: '#242A2A' }}
                >
                    Back to Ledger
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/ledger')}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: '#242A2A' }}
                    >
                        <FaArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#242A2A' }}>
                            <FaUser className="inline mr-2" />
                            {customer.name}
                        </h1>
                        <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>
                            {customer.phone}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                    style={{ backgroundColor: '#242A2A' }}
                >
                    Export PDF
                </button>
            </div>

            {/* Customer Info Card */}
            <div className="p-4 rounded-lg shadow mb-6" style={{ backgroundColor: '#EBE0C0' }}>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <p className="text-xs" style={{ color: '#6B7280' }}>Phone</p>
                        <p className="font-medium" style={{ color: '#242A2A' }}>{customer.phone || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="p-4 rounded-lg shadow bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                        <FaFileInvoice className="text-blue-600" />
                        <p className="text-xs text-blue-600">Total Invoices</p>
                    </div>
                    <p className="text-xl font-bold text-blue-700">{summary.total_invoices}</p>
                </div>
                <div className="p-4 rounded-lg shadow bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                        <FaMoneyBillWave className="text-gray-600" />
                        <p className="text-xs text-gray-600">Total Purchase</p>
                    </div>
                    <p className="text-xl font-bold text-gray-700">
                        Rs. {Number(summary.total_purchase).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow bg-green-50">
                    <p className="text-xs text-green-600 mb-2">Cash Purchases</p>
                    <p className="text-xl font-bold text-green-700">
                        Rs. {Number(summary.total_cash).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow bg-amber-50">
                    <p className="text-xs text-amber-600 mb-2">Credit Purchases</p>
                    <p className="text-xl font-bold text-amber-700">
                        Rs. {Number(summary.total_credit).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow bg-emerald-50">
                    <p className="text-xs text-emerald-600 mb-2">Total Paid</p>
                    <p className="text-xl font-bold text-emerald-700">
                        Rs. {Number(summary.total_paid).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 rounded-lg shadow" style={{ backgroundColor: Number(summary.balance) > 0 ? '#FEE2E2' : '#D1FAE5' }}>
                    <p className="text-xs mb-2" style={{ color: Number(summary.balance) > 0 ? '#DC2626' : '#059669' }}>
                        Balance
                    </p>
                    <p className="text-xl font-bold" style={{ color: Number(summary.balance) > 0 ? '#DC2626' : '#059669' }}>
                        Rs. {Number(summary.balance).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-4" style={{ borderColor: '#E5E7EB' }}>
                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'invoices'
                            ? 'border-[#242A2A] text-[#242A2A]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaFileInvoice className="inline mr-2" />
                    Invoices ({invoices.length})
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                        activeTab === 'payments'
                            ? 'border-[#242A2A] text-[#242A2A]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaMoneyBillWave className="inline mr-2" />
                    Payments ({payments.length})
                </button>
            </div>

            {/* Data Tables */}
            {activeTab === 'invoices' ? (
                <DataTable
                    columns={invoiceColumns}
                    data={invoices}
                />
            ) : (
                <DataTable
                    columns={paymentColumns}
                    data={payments}
                />
            )}
        </div>
    );
};

export default CustomerLedgerDetails;
