// backend/src/interfaces/DashboardServiceInterface.ts
interface DashboardServiceInterface {
    getSummary(userId: number): Promise<any>;
}

export default DashboardServiceInterface;
