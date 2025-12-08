// backend/src/interfaces/activeRepositoryInterface.ts
interface ActiveRepositoryInterface {
    create(name: string, type: string, userId: number): Promise<any>;
    findAll(userId: number): Promise<any[]>;
    findById(id: number, userId: number): Promise<any>;
    update(
        id: number,
        name: string,
        type: string,
        userId: number,
    ): Promise<any>;
    delete(id: number, userId: number): Promise<void>;
}

export default ActiveRepositoryInterface;
