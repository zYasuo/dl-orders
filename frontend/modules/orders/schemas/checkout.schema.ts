import { z } from 'zod';

function trim(s: string): string {
    return s.trim();
}

function requiredField(label: string, max: number) {
    return z
        .string()
        .max(max)
        .refine((s) => trim(s).length >= 1, { message: `${label} is required` });
}

export function composeOrderDescription(values: {
    notes: string;
    deliveryFullName: string;
    deliveryLine1: string;
    deliveryLine2: string;
    deliveryCity: string;
    deliveryState: string;
    deliveryPostalCode: string;
    deliveryCountry: string;
}): string {
    const parts: string[] = [];
    const name = trim(values.deliveryFullName);
    const line1 = trim(values.deliveryLine1);
    const line2 = trim(values.deliveryLine2);
    const city = trim(values.deliveryCity);
    const state = trim(values.deliveryState);
    const postal = trim(values.deliveryPostalCode);
    const country = trim(values.deliveryCountry);
    const cityLine = [city, state, postal].filter(Boolean).join(', ');
    if (name || line1 || line2 || cityLine || country) {
        parts.push('--- Delivery ---');
        if (name) {
            parts.push(name);
        }
        if (line1) {
            parts.push(line1);
        }
        if (line2) {
            parts.push(line2);
        }
        if (cityLine) {
            parts.push(cityLine);
        }
        if (country) {
            parts.push(country);
        }
    }
    const notes = trim(values.notes);
    if (notes) {
        if (parts.length) {
            parts.push('');
        }
        parts.push('--- Order notes ---');
        parts.push(notes);
    }
    return parts.join('\n').trim();
}

export function buildCheckoutSchema(maxStock: number | null) {
    const quantityBase = z.coerce.number().int('Invalid quantity').min(1, 'Minimum is 1');
    const quantity =
        maxStock !== null && maxStock > 0
            ? quantityBase.max(maxStock, `At most ${maxStock} unit(s) in stock.`)
            : quantityBase;
    const optionalLine = z.string().max(200);

    return z
        .object({
            quantity,
            notes: z.string().max(400),
            recipient: z.string().email('Invalid recipient email'),
            deliveryFullName: requiredField('Full name', 120),
            deliveryLine1: requiredField('Address line 1', 120),
            deliveryLine2: optionalLine,
            deliveryCity: requiredField('City', 120),
            deliveryState: optionalLine,
            deliveryPostalCode: z.string().max(32),
            deliveryCountry: requiredField('Country', 120),
        })
        .superRefine((data, ctx) => {
            const composed = composeOrderDescription(data);
            if (composed.length > 500) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'Delivery + notes combined must be at most 500 characters.',
                    path: ['notes'],
                });
            }
        });
}

export type CheckoutFormValues = z.infer<ReturnType<typeof buildCheckoutSchema>>;
