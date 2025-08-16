export declare enum OAuthProvider {
    GOOGLE = "google",
    MICROSOFT = "microsoft",
    GITHUB = "github"
}
export declare class OAuthAuthorizationDto {
    provider: OAuthProvider;
    redirectUri: string;
    scopes?: string;
    state?: string;
}
export declare class OAuthCallbackDto {
    code: string;
    provider: OAuthProvider;
    state?: string;
    redirectUri?: string;
}
export declare class LinkOAuthAccountDto {
    provider: OAuthProvider;
    code: string;
    currentPassword: string;
}
export declare class UnlinkOAuthAccountDto {
    provider: OAuthProvider;
    currentPassword: string;
}
//# sourceMappingURL=oauth.dto.d.ts.map