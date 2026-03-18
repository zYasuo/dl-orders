import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CheckQuantityInInventoryUseCase } from '../../application/use-cases/check-quantity-in-inventory';

@Injectable()
export class LowStockCronService implements OnModuleInit {
  private readonly logger = new Logger(LowStockCronService.name);
  private isRunning = false;

  constructor(private readonly checkQuantityInInventoryUseCase: CheckQuantityInInventoryUseCase) {}

  async onModuleInit(): Promise<void> {
    await this.runOnce();
  }

  @Cron('*/5 * * * *')
  async handleLowStockCron(): Promise<void> {
    await this.runOnce();
  }

  private async runOnce(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      this.logger.log('Low stock check started');
      await this.checkQuantityInInventoryUseCase.execute();
      this.logger.log('Low stock check finished');
    } catch (error) {
      const message = error instanceof Error ? error.stack ?? error.message : String(error);
      this.logger.error(message);
    } finally {
      this.isRunning = false;
    }
  }
}

