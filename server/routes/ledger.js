const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

// Get all customers with ledger summary
router.get("/customers", authorization, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.name,
                c.phone,
                COUNT(DISTINCT si.id) as total_invoices,
                COALESCE(SUM(si.total_amount), 0) as total_purchase,
                COALESCE(SUM(CASE WHEN si.type = 'cash' THEN si.total_amount ELSE 0 END), 0) as total_cash,
                COALESCE(SUM(CASE WHEN si.type = 'credit' THEN si.total_amount ELSE 0 END), 0) as total_credit,
                COALESCE((
                    SELECT SUM(p.amount) 
                    FROM payments p 
                    WHERE p.type = 'customer' AND p.partner_id = c.id
                ), 0) as total_paid,
                c.ledger_balance as balance
            FROM customers c
            LEFT JOIN sales_invoices si ON c.id = si.customer_id
            GROUP BY c.id
            ORDER BY c.name
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single customer ledger details
router.get("/customer/:id", authorization, async (req, res) => {
    const { id } = req.params;
    
    try {
        // Get customer info
        const customerResult = await pool.query(
            "SELECT id, name, phone FROM customers WHERE id = $1",
            [id]
        );
        
        if (customerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        const customer = customerResult.rows[0];

        // Get all invoices for this customer
        const invoicesResult = await pool.query(`
            SELECT 
                si.id,
                'INV-' || LPAD(si.id::text, 5, '0') as invoice_number,
                si.created_at as date,
                si.type,
                si.total_amount,
                COUNT(sit.id) as items_count
            FROM sales_invoices si
            LEFT JOIN sales_items sit ON si.id = sit.invoice_id
            WHERE si.customer_id = $1
            GROUP BY si.id
            ORDER BY si.created_at DESC
        `, [id]);

        // Get all payments from this customer
        const paymentsResult = await pool.query(`
            SELECT 
                id,
                amount,
                method as payment_type,
                '' as reference,
                '' as notes,
                created_at
            FROM payments
            WHERE type = 'customer' AND partner_id = $1
            ORDER BY created_at DESC
        `, [id]);

        // Calculate summary
        const summaryResult = await pool.query(`
            SELECT 
                COUNT(DISTINCT si.id) as total_invoices,
                COALESCE(SUM(si.total_amount), 0) as total_purchase,
                COALESCE(SUM(CASE WHEN si.type = 'cash' THEN si.total_amount ELSE 0 END), 0) as total_cash,
                COALESCE(SUM(CASE WHEN si.type = 'credit' THEN si.total_amount ELSE 0 END), 0) as total_credit,
                COALESCE((
                    SELECT SUM(p.amount) 
                    FROM payments p 
                    WHERE p.type = 'customer' AND p.partner_id = $1
                ), 0) as total_paid,
                c.ledger_balance as balance
            FROM customers c
            LEFT JOIN sales_invoices si ON c.id = si.customer_id
            WHERE c.id = $1
            GROUP BY c.id
        `, [id]);

        const summary = summaryResult.rows[0] || {
            total_invoices: 0,
            total_purchase: 0,
            total_cash: 0,
            total_credit: 0,
            total_paid: 0,
            balance: 0
        };

        res.json({
            customer,
            invoices: invoicesResult.rows,
            payments: paymentsResult.rows,
            summary
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
