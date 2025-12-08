// backend/src/interfaces/DashboardRepositoryInterface.ts
interface DashboardRepositoryInterface {
    findActivesWithBalances(userId: number): Promise<any[]>;
    findActivesWithLatestBalances(userId: number): Promise<any[]>;
    findWallets(userId: number): Promise<any[]>;
    findTransactions(userId: number): Promise<any[]>;
    findInvestments(userId: number): Promise<any[]>;
}

export default DashboardRepositoryInterface;
