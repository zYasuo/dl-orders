import { IResetPasswordRequestEvent } from "@app/shared/auth";


export abstract class IResetPasswordPublisherPort {
    abstract publish(event: IResetPasswordRequestEvent): Promise<void>;
}