import { CartView } from '@/modules/cart/components/cart-view';

export default function CartPage() {
    return (
        <div className="mx-auto w-full max-w-5xl">
            <header className="mb-12 space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Cart</h1>
                <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    Items stay on this device for about twenty minutes. Refresh stock before you pay.
                </p>
            </header>
            <CartView />
        </div>
    );
}
