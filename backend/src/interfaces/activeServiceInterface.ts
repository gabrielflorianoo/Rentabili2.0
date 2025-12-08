// backend/src/interfaces/activeServiceInterface.ts
interface ActiveServiceInterface {
    createActive(name: string, type: string, userId: number): Promise<any>;
    getActives(userId: number): Promise<any[]>;
    getActiveById(id: number, userId: number): Promise<any>;
    updateActive(
        id: number,
        name: string,
        type: string,
        userId: number,
    ): Promise<any>;
    deleteActive(id: number, userId: number): Promise<void>;
}

export default ActiveServiceInterface;
