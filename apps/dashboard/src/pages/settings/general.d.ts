import { NextPage } from 'next';
interface GeneralSettings {
    company: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        logo: string;
        taxNumber: string;
    };
    localization: {
        timezone: string;
        currency: string;
        language: string;
        dateFormat: string;
        numberFormat: string;
    };
    system: {
        sessionTimeout: number;
        autoBackup: boolean;
        backupFrequency: string;
        maintenanceMode: boolean;
        debugMode: boolean;
        logLevel: string;
    };
    fiscal: {
        yearStart: string;
        yearEnd: string;
        currentPeriod: string;
    };
}
declare const GeneralSettings: NextPage;
export default GeneralSettings;
//# sourceMappingURL=general.d.ts.map