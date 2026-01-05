import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, User } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Support</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>
                            Get in touch with our support team directly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium leading-none">Name</p>
                                <p className="text-sm text-muted-foreground">Suhas</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium leading-none">Phone</p>
                                <p className="text-sm text-muted-foreground">7995528176</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium leading-none">Address</p>
                                <p className="text-sm text-muted-foreground">
                                    4-13-73 yerrugipalli pulivendula
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
