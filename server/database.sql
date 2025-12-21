CREATE DATABASE tractor_spare_parts;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50),
    opening_stock INTEGER DEFAULT 0,
    opening_cost DECIMAL(10, 2) DEFAULT 0.00,
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers Table
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'PKR',
    ledger_balance DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    ledger_balance DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Import Invoices Table
CREATE TABLE import_invoices (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    invoice_no VARCHAR(100),
    currency VARCHAR(10),
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0000,
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft', -- draft, finalized
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Import Items Table
CREATE TABLE import_items (
    id SERIAL PRIMARY KEY,
    import_invoice_id INTEGER REFERENCES import_invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL
);

-- Sales Invoices Table
CREATE TABLE sales_invoices (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    type VARCHAR(20) DEFAULT 'cash', -- cash, credit
    total_amount DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft', -- draft, finalized
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Items Table
CREATE TABLE sales_items (
    id SERIAL PRIMARY KEY,
    sales_invoice_id INTEGER REFERENCES sales_invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL
);

-- Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- customer, supplier
    reference_id INTEGER, -- Can be linked to invoice if needed, or just general payment
    partner_id INTEGER NOT NULL, -- customer_id or supplier_id
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(50) DEFAULT 'cash', -- cash, bank
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Movements Table
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    quantity_change INTEGER NOT NULL,
    movement_type VARCHAR(50) NOT NULL, -- import, sale, adjustment
    reference_id INTEGER, -- invoice id
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
