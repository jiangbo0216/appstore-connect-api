import { Base } from './base';
import { AxiosError, AxiosInstance } from 'axios';
/**
 * session data format
 */
export interface Session {
    agreeToTerms: boolean;
    availableProviders: [AppStoreProvider];
    backingType: string;
    backingTypes: [string];
    featureFlags: [string];
    helpLinks: [any];
    modules: [any];
    provider: AppStoreProvider;
    publicUserId: string;
    roles: [string];
    termsSignatures: [string];
    user: AppStoreUser;
    userProfile: [any];
}
export interface Phone {
    numberWithDialCode: string;
    obfuscatedNumber: string;
    pushMode: string;
    id: number;
}
/**
 * phones data format
 */
export interface Phones {
    trustedPhoneNumbers: [Phone];
}
/**
 * AppStore Connect Provider
 */
export interface AppStoreProvider {
    contentTypes: [string];
    name: string;
    providerId: number;
    subType: string;
}
export interface AccountSummary {
    canCreateAppBundles: boolean;
    canCreateIOSApps: boolean;
    canCreateMacApps: boolean;
    catalogReportsLink: string;
    cloudStorageEnabled: boolean;
    cloudStorageLink: string;
    contractAnnouncements: [any];
    enabledPlatforms: [string];
    gameCenterGroupLink: string;
    macBundlesEnabled: boolean;
    removedAppCount: number;
    sharedSecretLink: string;
    showSharedSecret: boolean;
    summaries: [App];
}
export interface App {
    adamId: string;
    appType: null | string;
    buildVersionSets: [any];
    bundleId: string;
    iconUrl: string;
    issuesCount: number;
    lastModifiedDate: number;
    name: string;
    preOrderEndDate: any;
    priceTier: any;
    type: any;
    vendorId: string;
    versionSets: [any];
}
/**
 * AppStore Connect User
 */
export interface AppStoreUser {
    emailAddress: string;
    firstName: string;
    fullName: string;
    lastName: string;
    prsId: string;
}
export interface AppStoreUserDetail {
    associatedAccounts: [{
        contentProvider: {
            contentProviderId: number;
            contentProviderPublicId: string;
            name: string;
            contentProviderTypes: [string];
        };
        roles: [string];
        lastLogin: number;
    }];
    sessionToken: AppStoreSessionToken;
    visibility: boolean;
    userName: string;
    userId: string;
}
export interface AppStoreSessionToken {
    dsId: string;
    contentProviderId: number;
    ipAddress: null | string;
}
export declare class Client extends Base {
    private signinUrl;
    private authRequestUrl;
    private wdigetKeyUrl;
    private securityCodeUrl;
    private phonesUrl;
    apiEndPoint: string;
    trustUrl: string;
    private authServiceWidgetKey?;
    private sessionData?;
    private apps?;
    private userDetail?;
    private headers;
    private password;
    private appleId;
    constructor(appleId: string, password: string, axiosInstance?: AxiosInstance);
    private widgetKey;
    /**
     * signin with Apple ID and Password
     * !CAUTION: do not support two-step verification
     * @param appleId Apple ID(email format)
     * @param password Apple ID Password (no two-step verification)
     */
    signin(): Promise<string | [Phone]>;
    authRequest(): Promise<Phones>;
    sendSMS(id: string): Promise<any>;
    /**
     * get session data
     */
    session(): Promise<Session>;
    /**
     * get current provider
     */
    currentProvider(): Promise<AppStoreProvider>;
    getDetail(): Promise<AppStoreUserDetail | undefined>;
    sessionToken(): Promise<AppStoreSessionToken | undefined>;
    selectTeam(providerId: string): Promise<void>;
    /**
     * list apps in current provider
     */
    listApps(): Promise<[App] | undefined>;
    updateRequestHeaders(resp: AxiosError): void;
    securityCodeRequest(code: string): Promise<any>;
    trust(): Promise<any>;
}
