# Dashboard Calculation Fix - Verification Guide

## Problems Fixed

### 1. Wallet Balance Calculation
**Problem**: The `wallet.balance` field was static and not updated when transactions were created/updated/deleted.

**Solution**: Modified `dashboardRepository.findWallets()` to dynamically calculate wallet balance from transactions:
- Income transactions: add to balance
- Expense transactions: subtract from balance
- Only includes transactions up to the current date

**Expected Result**: Wallet balances now accurately reflect the sum of all income minus all expenses from the transaction table.

### 2. Future-Dated Records
**Problem**: The database contained records with future dates (e.g., 2026), and the dashboard was including these in calculations, resulting in inflated values.

**Solution**: Added date filtering to all repository methods:
- `findActivesWithLatestBalances()`: Only considers balances with `date <= now`
- `findBalanceHistory()`: Only includes historical balances up to current date
- `findInvestments()`: Excludes investments with future dates
- `findTransactions()`: Excludes transactions with future dates
- `findWallets()`: Only includes transactions up to current date in balance calculation

**Expected Result**: Dashboard calculations only use data from past and present, not future projections.

## Verification Steps

### Manual Database Verification (if database access is available)

1. **Check Wallet Balances**:
```sql
-- For each wallet, calculate the balance from transactions
SELECT 
    w.id,
    w.name,
    w.balance as stored_balance,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as calculated_balance
FROM "Wallet" w
LEFT JOIN "Transaction" t ON t."walletId" = w.id AND t.date <= NOW()
WHERE w."userId" = 1
GROUP BY w.id, w.name, w.balance;
```

2. **Check Active Balances (excluding future dates)**:
```sql
-- Get the latest balance for each active (excluding future dates)
SELECT 
    a.id,
    a.name,
    (SELECT hb.value 
     FROM "HistoricalBalance" hb 
     WHERE hb."activeId" = a.id AND hb.date <= NOW()
     ORDER BY hb.date DESC 
     LIMIT 1) as latest_balance
FROM "Active" a
WHERE a."userId" = 1;
```

3. **Check Total Aportado (only Investimento, excluding future dates)**:
```sql
SELECT 
    SUM(amount) as total_aportado,
    COUNT(*) as num_investimentos
FROM "Investment"
WHERE "userId" = 1 
  AND kind != 'Renda'
  AND date <= NOW();
```

### Expected Dashboard Values (for User ID 1, based on current date December 9, 2025)

Based on the CSV data provided and current date:

**Investments (kind="Investimento", excluding future dates)**:
- id 353: 4238.11 (2025-11-21) ✓
- id 354: 4349.53 (2025-06-09) ✓
- id 355: 3106.99 (2025-12-08) ✓
- **Total Aportado: R$ 11,694.63**

**HistoricalBalance (most recent <= now for each active)**:
- Active 12: Most recent balance on or before today
- Active 13: Most recent balance on or before today
- Active 14: Most recent balance on or before today
- Need to check database for actual values

**Transactions (with walletId=1, excluding future dates)**:
- id 1: 5000.00 income (2025-01-15) ✓
- id 2: 1000.00 expense (2025-01-20) ✓
- id 3: 2000.00 income (2025-02-10) ✓
- **Wallet Balance: R$ 6,000.00** (5000 - 1000 + 2000)

Transactions without walletId (should NOT affect wallet balance):
- id 4, 5, 6, 8, 9 have no walletId, so they don't affect any wallet balance

**Dashboard Calculations**:
1. Patrimônio Total = Active Balances + Wallet Balances
2. Total Aportado = R$ 11,694.63 ✓
3. Total Gain = Patrimônio Total - Total Aportado
4. Rentabilidade = (Total Gain / Total Aportado) × 100

## Testing the Fix

### Using the Debug Endpoint

Access the debug endpoint to see detailed investment breakdown:
```
GET /api/dashboard/debug
Authorization: Bearer <token>
```

This will show:
- Total investments count
- Breakdown by kind (Investimento vs Renda)
- Total with and without Renda
- Detailed list of all investments

### Using Test Scripts

Run the existing test script to verify logic:
```bash
cd backend
node test_dashboard_logic.js
```

### Integration Test

If the backend is running, test the dashboard endpoint:
```bash
curl -X GET http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer <token>"
```

Expected response should show:
- `totalInvested`: Sum of investments where kind != 'Renda' and date <= now
- `totalBalance`: Sum of active balances (date <= now) + wallet balances (calculated from transactions with date <= now)
- `totalGain`: totalBalance - totalInvested
- `profitability`: (totalGain / totalInvested) × 100

## Common Issues and Solutions

### Issue 1: Large negative wallet balances
**Cause**: Transactions without walletId are being included in wallet balance
**Solution**: The fix ensures only transactions with walletId are included (via Prisma relationship)

### Issue 2: Inflated patrimony values
**Cause**: Future-dated balances/investments being included
**Solution**: All queries now filter to `date <= now`

### Issue 3: Incorrect "Total Aportado"
**Cause**: "Renda" investments being counted as aportes
**Solution**: Already handled - only investments with `kind !== 'Renda'` are counted

## Files Modified

1. `/backend/src/repositories/dashboardRepository.js`
   - `findWallets()`: Calculate balance from transactions
   - `findActivesWithLatestBalances()`: Filter by date <= now
   - `findBalanceHistory()`: Filter by date <= now
   - `findInvestments()`: Filter by date <= now
   - `findTransactions()`: Filter by date <= now

## Notes

- The dashboard service logic was already correct; the issue was in the data being fetched
- No changes were needed to the frontend
- No changes were needed to the calculation logic in `dashboardService.js`
- All changes are backward compatible
