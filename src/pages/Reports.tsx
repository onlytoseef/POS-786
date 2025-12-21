import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import DatePicker from '../components/ui/DatePicker';
import SelectInput from '../components/ui/SelectInput';
import DataTable from '../components/ui/DataTable';
import useCurrencyConverter from '../hooks/useCurrencyConverter';
import toast from 'react-hot-toast';

interface DailyReportData {
    sales: any[];
    imports: any[];
    payments: any[];
}

interface Supplier {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    name: string;
}

const Reports = () => {
    const [reportType, setReportType] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { formatPKR } = useCurrencyConverter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [suppRes, custRes] = await Promise.all([
                    api.get('/suppliers'),
                    api.get('/customers'),
                ]);
                setSuppliers(suppRes.data);
                setCustomers(custRes.data);
            } catch (err: any) {
                toast.error('Failed to load data');
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const fetchReport = async () => {
        // Validation
        if (reportType === 'supplier' && !selectedSupplier) {
            toast.error('Please select a supplier');
            return;
        }
        if (reportType === 'customer' && !selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }

        setLoading(true);
        try {
            let endpoint = '';
            if (reportType === 'daily') {
                endpoint = `/dashboard/daily?date=${selectedDate}`;
            } else if (reportType === 'supplier' && selectedSupplier) {
                endpoint = `/dashboard/supplier/${selectedSupplier}`;
            } else if (reportType === 'customer' && selectedCustomer) {
                endpoint = `/dashboard/customer/${selectedCustomer}`;
            }
            
            if (endpoint) {
                const res = await api.get(endpoint);
                setReportData(res.data);
                toast.success('Report generated successfully!');
            }
        } catch (err: any) {
            toast.error('Failed to generate report');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) {
            toast.error('No data to export');
            return;
        }
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => 
            Object.values(row).map(val => 
                typeof val === 'string' ? `"${val}"` : val
            ).join(',')
        );
        
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        toast.success(`${filename}.csv exported successfully!`);
    };

    const salesColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Customer', accessor: 'customer_name' },
        { header: 'Type', accessor: 'type' },
        { header: 'Total', accessor: (item: any) => formatPKR(item.total_amount) },
    ];

    const importColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Supplier', accessor: 'supplier_name' },
        { header: 'Invoice #', accessor: 'invoice_no' },
        { header: 'Total', accessor: (item: any) => formatPKR(item.total_amount) },
    ];

    const paymentColumns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Type', accessor: 'type' },
        { header: 'Partner', accessor: 'partner_name' },
        { header: 'Amount', accessor: (item: any) => formatPKR(item.amount) },
        { header: 'Method', accessor: 'method' },
    ];

    return (
        <div>
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#242A2A' }}>Reports</h1>
                <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>Generate daily, supplier, and customer reports</p>
            </div>

            <div className="rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
                    <SelectInput
                        label="Report Type"
                        options={[
                            { value: 'daily', label: 'Daily Report' },
                            { value: 'supplier', label: 'Supplier Report' },
                            { value: 'customer', label: 'Customer Report' },
                        ]}
                        value={reportType}
                        onChange={setReportType}
                    />

                    {reportType === 'daily' && (
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                    )}

                    {reportType === 'supplier' && (
                        <SelectInput
                            label="Select Supplier"
                            options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                            value={selectedSupplier}
                            onChange={setSelectedSupplier}
                        />
                    )}

                    {reportType === 'customer' && (
                        <SelectInput
                            label="Select Customer"
                            options={customers.map(c => ({ value: c.id, label: c.name }))}
                            value={selectedCustomer}
                            onChange={setSelectedCustomer}
                        />
                    )}

                    <Button onClick={fetchReport} disabled={loading}>
                        {loading ? 'Loading...' : 'Generate Report'}
                    </Button>
                </div>
            </div>

            {reportData && reportType === 'daily' && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#242A2A' }}>Sales - {selectedDate}</h2>
                            <Button variant="secondary" size="sm" onClick={() => exportToCSV(reportData.sales || [], `sales-${selectedDate}`)}>
                                Export CSV
                            </Button>
                        </div>
                        <DataTable columns={salesColumns} data={reportData.sales || []} />
                        <p className="mt-4 text-right font-bold text-sm sm:text-base" style={{ color: '#242A2A' }}>
                            Total: {formatPKR((reportData.sales || []).reduce((sum: number, s: any) => sum + parseFloat(s.total_amount || 0), 0))}
                        </p>
                    </div>

                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#242A2A' }}>Imports - {selectedDate}</h2>
                            <Button variant="secondary" size="sm" onClick={() => exportToCSV(reportData.imports || [], `imports-${selectedDate}`)}>
                                Export CSV
                            </Button>
                        </div>
                        <DataTable columns={importColumns} data={reportData.imports || []} />
                    </div>

                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#242A2A' }}>Payments - {selectedDate}</h2>
                            <Button variant="secondary" size="sm" onClick={() => exportToCSV(reportData.payments || [], `payments-${selectedDate}`)}>
                                Export CSV
                            </Button>
                        </div>
                        <DataTable columns={paymentColumns} data={reportData.payments || []} />
                    </div>
                </div>
            )}

            {reportData && reportType === 'supplier' && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4" style={{ color: '#242A2A' }}>Supplier: {reportData.supplier?.name}</h2>
                        <p className="text-base sm:text-lg" style={{ color: '#6B7280' }}>Outstanding Balance: <span className="font-bold" style={{ color: '#EF4444' }}>{formatPKR(reportData.supplier?.ledger_balance || 0)}</span></p>
                    </div>
                    
                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#242A2A' }}>Import History</h3>
                            <Button variant="secondary" size="sm" onClick={() => exportToCSV(reportData.invoices || [], `supplier-imports`)}>
                                Export CSV
                            </Button>
                        </div>
                        <DataTable columns={importColumns} data={reportData.invoices || []} />
                    </div>

                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#242A2A' }}>Payment History</h3>
                            <Button variant="secondary" size="sm" onClick={() => exportToCSV(reportData.payments || [], `supplier-payments`)}>
                                Export CSV
                            </Button>
                        </div>
                        <DataTable columns={paymentColumns} data={reportData.payments || []} />
                    </div>
                </div>
            )}

            {reportData && reportType === 'customer' && (
                <div className="space-y-4 sm:space-y-6">
                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4" style={{ color: '#242A2A' }}>Customer: {reportData.customer?.name}</h2>
                        <p className="text-base sm:text-lg" style={{ color: '#6B7280' }}>Outstanding Balance: <span className="font-bold" style={{ color: '#10B981' }}>{formatPKR(reportData.customer?.ledger_balance || 0)}</span></p>
                    </div>
                    
                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#242A2A' }}>Sales History</h3>
                            <Button variant="secondary" size="sm" onClick={() => exportToCSV(reportData.invoices || [], `customer-sales`)}>
                                Export CSV
                            </Button>
                        </div>
                        <DataTable columns={salesColumns} data={reportData.invoices || []} />
                    </div>

                    <div className="rounded-xl shadow-md p-4 sm:p-6 border-2" style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#242A2A' }}>Payment History</h3>
                            <Button variant="secondary" size="sm" onClick={() => exportToCSV(reportData.payments || [], `customer-payments`)}>
                                Export CSV
                            </Button>
                        </div>
                        <DataTable columns={paymentColumns} data={reportData.payments || []} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
