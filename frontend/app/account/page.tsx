import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/modules/account/components/profile-form';

export default function AccountPage() {
    return (
        <div className="mx-auto w-full max-w-lg">
            <Card>
                <CardHeader>
                    <CardTitle>My account</CardTitle>
                    <CardDescription>Data synced with the Users service.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm />
                </CardContent>
            </Card>
        </div>
    );
}
