import { IResetPasswordRequestEvent } from '@app/shared/auth';

export abstract class ResetPasswordPublisherPort {
  abstract publish(event: IResetPasswordRequestEvent): Promise<void>;
}
