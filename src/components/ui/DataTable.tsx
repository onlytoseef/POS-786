import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
}

function DataTable<T extends { id: number | string }>({ columns, data, onEdit, onDelete }: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-xl shadow-md border-2" style={{ borderColor: '#EBE0C0' }}>
            <table className="min-w-full">
                <thead style={{ backgroundColor: '#242A2A' }}>
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                scope="col"
                                className={`py-3 sm:py-4 px-3 sm:px-4 text-left text-xs sm:text-sm font-semibold ${col.className || ''}`}
                                style={{ color: '#EBE0C0' }}
                            >
                                {col.header}
                            </th>
                        ))}
                        {(onEdit || onDelete) && (
                            <th scope="col" className="relative py-3 sm:py-4 px-3 sm:px-4">
                                <span className="sr-only">Actions</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {data.length === 0 ? (
                        <tr>
                            <td 
                                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} 
                                className="py-8 sm:py-12 text-center text-sm"
                                style={{ color: '#6B7280' }}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: '#D4C9A8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <span>No data available</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((item, rowIdx) => (
                            <tr 
                                key={item.id} 
                                className="hover:bg-[#F5F0E0] transition-colors cursor-pointer border-b"
                                style={{ backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#FAFAF5', borderColor: '#EBE0C0' }}
                                onClick={() => onEdit && onEdit(item)}
                            >
                                {columns.map((col, idx) => (
                                    <td
                                        key={idx}
                                        className={`whitespace-nowrap py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm ${col.className || ''}`}
                                        style={{ color: '#242A2A' }}
                                    >
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(item)
                                            : (item[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="relative whitespace-nowrap py-3 sm:py-4 px-3 sm:px-4 text-right text-xs sm:text-sm font-medium">
                                        {onEdit && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                                className="mr-2 sm:mr-3 px-2 py-1 rounded-md transition-colors hover:bg-[#EBE0C0]"
                                                style={{ color: '#242A2A' }}
                                            >
                                                View
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                                className="px-2 py-1 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
