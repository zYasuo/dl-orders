export const PATTERNS = {
    ORDER_CREATION_REQUESTED: 'order.creation_requested',
    INVENTORY_RESERVED: 'inventory.reserved',
    INVENTORY_RESERVATION_FAILED: 'inventory.reservation_failed',
    ORDER_CONFIRMED: 'order.confirmed',
    USER_VERIFIED: 'user.verified',
    OTP_SEND_REQUESTED: 'otp.send_requested',
    PAYMENT_APPROVED: 'payment.approved',
    PAYMENT_FAILED: 'payment.failed',
    INVENTORY_RESERVED_FOR_PAYMENT: 'inventory.reserved_for_payment',
} as const;
