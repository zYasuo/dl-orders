import { Test, TestingModule } from '@nestjs/testing';
import { HandleAccountLockedNotifyUseCase } from '../../../src/application/use-cases/handle-account-locked-notify.use-case';
import { IEmailSenderPort } from '../../../src/domain/ports/email-sender.port';

describe('HandleAccountLockedNotifyUseCase', () => {
    let sut: HandleAccountLockedNotifyUseCase;
    let emailSender: jest.Mocked<IEmailSenderPort>;

    beforeEach(async () => {
        jest.clearAllMocks();
        emailSender = {
            send: jest.fn().mockResolvedValue({ success: true }),
        } as unknown as jest.Mocked<IEmailSenderPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [HandleAccountLockedNotifyUseCase, { provide: IEmailSenderPort, useValue: emailSender }],
        }).compile();

        sut = module.get(HandleAccountLockedNotifyUseCase);
    });

    describe('execute', () => {
        it('sends email with subject and html containing lockout duration', async () => {
            const payload = {
                email: 'user@test.com',
                lockedUntilMinutes: 5,
            };

            await sut.execute(payload);

            expect(emailSender.send).toHaveBeenCalledTimes(1);
            expect(emailSender.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@test.com',
                    subject: 'Account temporarily locked - Login attempts',
                }),
            );
            const call = emailSender.send.mock.calls[0][0];
            expect(call.html).toContain('5 minutes');
            expect(call.html).toContain('temporarily locked');
        });

        it('does not throw when email send fails', async () => {
            emailSender.send.mockResolvedValueOnce({
                success: false,
                error: 'SMTP error',
            });

            await expect(
                sut.execute({
                    email: 'user@test.com',
                    lockedUntilMinutes: 5,
                }),
            ).resolves.not.toThrow();
        });
    });
});
