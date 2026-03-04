import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from '../../../../../product/application/use-cases/create-product.use-case';
import { IProductRepositoryPort } from '../../../../../product/domain/ports/product-repository.ports';
import { InMemoryProductRepository } from '../../../../doubles/in-memory-product.repository';

describe('CreateProductUseCase (integration)', () => {
    let sut: CreateProductUseCase;
    let productRepository: InMemoryProductRepository;

    beforeEach(async () => {
        productRepository = new InMemoryProductRepository();

        const module: TestingModule = await Test.createTestingModule({
            providers: [CreateProductUseCase, { provide: IProductRepositoryPort, useValue: productRepository }],
        }).compile();

        sut = module.get(CreateProductUseCase);
    });

    describe('execute', () => {
        it('persists product and returns it', async () => {
            const input = { name: 'Product A', description: 'Description A', price: 99.9 };

            const result = await sut.execute(input);

            expect(result.name).toBe(input.name);
            expect(result.description).toBe(input.description);
            expect(result.price).toBe(input.price);
            expect(result.id).toBeDefined();

            const found = await productRepository.findById(result.id);
            expect(found).not.toBeNull();
            expect(found!.name).toBe(input.name);
            expect(found!.description).toBe(input.description);
            expect(found!.price).toBe(input.price);
        });
    });
});
