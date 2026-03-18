import { Injectable } from "@nestjs/common";
import { IInventoryRepositoryPort } from "../../domain/ports/inventory-repository.port";



@Injectable()
export class CheckQuantityInInventoryUseCase {
    constructor(private readonly inventoryRespository: IInventoryRepositoryPort)
    {}

    async execute(productId: string): Promise<void> {
        const allInventory = await this.inventoryRespository.findAll();


    }
}
