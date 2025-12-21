import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useCurrencyConverter from '../hooks/useCurrencyConverter';
import { FaChartLine, FaFileImport, FaBoxes, FaHandHoldingUsd, FaMoneyCheckAlt, FaWallet, FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { exportDashboardPDF } from '../utils/pdfExport';
import { DashboardSkeleton } from '../components/ui/Skeleton';

interface DashboardStats {
    todaySales: number;
    todayImports: number;
    stockValue: number;
    totalReceivables: number;
    totalPayables: number;
    todayCash: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { formatPKR } = useCurrencyConverter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (err: any) {
                if (err.code === 'ERR_NETWORK') {
                    toast.error('Cannot connect to server. Please ensure the server is running.');
                } else {
                    toast.error('Failed to load dashboard data');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const cards = [
        { title: "Today's Sales", value: formatPKR(stats?.todaySales || 0), icon: <FaChartLine />, accent: '#10B981' },
        { title: "Today's Imports", value: formatPKR(stats?.todayImports || 0), icon: <FaFileImport />, accent: '#3B82F6' },
        { title: "Stock Value", value: formatPKR(stats?.stockValue || 0), icon: <FaBoxes />, accent: '#8B5CF6' },
        { title: "Total Receivables", value: formatPKR(stats?.totalReceivables || 0), icon: <FaHandHoldingUsd />, accent: '#F59E0B' },
        { title: "Total Payables", value: formatPKR(stats?.totalPayables || 0), icon: <FaMoneyCheckAlt />, accent: '#EF4444' },
        { title: "Today's Cash", value: formatPKR(stats?.todayCash || 0), icon: <FaWallet />, accent: '#14B8A6' },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: '#242A2A' }}>Dashboard Overview</h1>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>Monitor your business performance at a glance</p>
                </div>
                <Button variant="secondary" onClick={() => {
                    exportDashboardPDF(stats);
                    toast.success('Dashboard PDF exported!');
                }}>
                    <FaFilePdf className="inline mr-1" /> Export Report
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {cards.map((card, index) => (
                    <div 
                        key={index} 
                        className="rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#EBE0C0' }}
                    >
                        <div className="h-1.5" style={{ backgroundColor: card.accent }}></div>
                        <div className="p-4 sm:p-5 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xs sm:text-sm font-medium" style={{ color: '#6B7280' }}>{card.title}</h3>
                                    <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2 truncate" style={{ color: '#242A2A' }}>{card.value}</p>
                                </div>
                                <div 
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ml-3"
                                    style={{ backgroundColor: '#EBE0C0', color: '#242A2A' }}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
