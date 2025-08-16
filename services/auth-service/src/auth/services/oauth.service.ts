import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export enum OAuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  GITHUB = 'github',
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: OAuthProvider;
}

export interface OAuthState {
  state: string;
  provider: OAuthProvider;
  redirectUri: string;
  userId?: string; // For linking existing accounts
  createdAt: Date;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly stateExpiry = 10 * 60 * 1000; // 10 minutes

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAuthorizationUrl(
    provider: OAuthProvider,
    redirectUri: string,
    userId?: string
  ): Promise<{ authUrl: string; state: string }> {
    const config = this.getOAuthConfig(provider);
    const state = this.generateState();
    
    // Store state for validation
    const stateData: OAuthState = {
      state,
      provider,
      redirectUri,
      userId,
      createdAt: new Date(),
    };
    
    await this.cacheManager.set(
      `oauth_state:${state}`,
      stateData,
      this.stateExpiry
    );

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scope,
      response_type: 'code',
      state,
    });

    if (provider === OAuthProvider.MICROSOFT) {
      params.append('response_mode', 'query');
    }

    const authUrl = `${config.authUrl}?${params.toString()}`;
    
    this.logger.log(`OAuth authorization URL generated for ${provider}`);
    
    return { authUrl, state };
  }

  async handleCallback(
    provider: OAuthProvider,
    code: string,
    state: string
  ): Promise<{ userInfo: OAuthUserInfo; isNewUser: boolean; existingUserId?: string }> {
    // Validate state
    const stateData = await this.cacheManager.get(`oauth_state:${state}`) as OAuthState;
    
    if (!stateData || stateData.provider !== provider) {
      throw new BadRequestException('Invalid or expired OAuth state');
    }

    // Clean up state
    await this.cacheManager.del(`oauth_state:${state}`);

    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(provider, code, stateData.redirectUri);
    
    // Get user info
    const userInfo = await this.getUserInfo(provider, tokenResponse.access_token);
    
    // Check if user already exists
    const existingUserId = await this.findUserByOAuthProvider(provider, userInfo.id);
    
    const result = {
      userInfo,
      isNewUser: !existingUserId,
      existingUserId,
    };

    this.logger.log(`OAuth callback processed for ${provider}, user: ${userInfo.email}`);
    
    return result;
  }

  async linkOAuthAccount(
    userId: string,
    provider: OAuthProvider,
    code: string,
    redirectUri: string
  ): Promise<void> {
    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(provider, code, redirectUri);
    
    // Get user info
    const userInfo = await this.getUserInfo(provider, tokenResponse.access_token);
    
    // Check if this OAuth account is already linked to another user
    const existingUserId = await this.findUserByOAuthProvider(provider, userInfo.id);
    
    if (existingUserId && existingUserId !== userId) {
      throw new BadRequestException('This OAuth account is already linked to another user');
    }

    // Store OAuth account linking
    await this.storeOAuthAccount(userId, provider, {
      providerId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
    });

    this.logger.log(`OAuth account linked: ${provider} for user ${userId}`);
  }

  async unlinkOAuthAccount(userId: string, provider: OAuthProvider): Promise<void> {
    await this.removeOAuthAccount(userId, provider);
    this.logger.log(`OAuth account unlinked: ${provider} for user ${userId}`);
  }

  async getUserOAuthAccounts(_userId: string): Promise<Array<{
    provider: OAuthProvider;
    email: string;
    name: string;
    linkedAt: Date;
  }>> {
    // This would typically fetch from database
    // For demo purposes, return empty array
    return [];
  }

  async refreshOAuthToken(userId: string, provider: OAuthProvider): Promise<string | null> {
    const account = await this.getOAuthAccount(userId, provider);
    
    if (!account || !account.refreshToken) {
      return null;
    }

    try {
      const config = this.getOAuthConfig(provider);
      const tokenResponse = await this.refreshAccessToken(config, account.refreshToken);
      
      // Update stored tokens
      await this.updateOAuthTokens(userId, provider, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || account.refreshToken,
        expiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
      });

      return tokenResponse.access_token;
    } catch (error) {
      this.logger.error(`Failed to refresh OAuth token for ${provider}`, error);
      return null;
    }
  }

  private async exchangeCodeForTokens(
    provider: OAuthProvider,
    code: string,
    redirectUri: string
  ): Promise<OAuthTokenResponse> {
    const config = this.getOAuthConfig(provider);
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    try {
      const response = await lastValueFrom(
        this.httpService.post(config.tokenUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        })
      );

      return response.data as OAuthTokenResponse;
    } catch (error) {
      this.logger.error(`Failed to exchange code for tokens: ${provider}`, (error as any).response?.data);
      throw new BadRequestException('Failed to authenticate with OAuth provider');
    }
  }

  private async refreshAccessToken(
    config: OAuthConfig,
    refreshToken: string
  ): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    });

    const response = await lastValueFrom(
      this.httpService.post(config.tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      })
    );

    return response.data as OAuthTokenResponse;
  }

  private async getUserInfo(provider: OAuthProvider, accessToken: string): Promise<OAuthUserInfo> {
    const config = this.getOAuthConfig(provider);
    
    try {
      const response = await lastValueFrom(
        this.httpService.get(config.userInfoUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        })
      );

      const userData = response.data;
      
      // Normalize user data based on provider
      return this.normalizeUserInfo(provider, userData);
    } catch (error) {
      this.logger.error(`Failed to get user info from ${provider}`, (error as any).response?.data);
      throw new BadRequestException('Failed to retrieve user information');
    }
  }

  private normalizeUserInfo(provider: OAuthProvider, userData: any): OAuthUserInfo {
    switch (provider) {
      case OAuthProvider.GOOGLE:
        return {
          id: userData.sub || userData.id,
          email: userData.email,
          name: userData.name,
          firstName: userData.given_name,
          lastName: userData.family_name,
          avatar: userData.picture,
          provider,
        };
      
      case OAuthProvider.MICROSOFT:
        return {
          id: userData.id,
          email: userData.userPrincipalName || userData.mail,
          name: userData.displayName,
          firstName: userData.givenName,
          lastName: userData.surname,
          provider,
        };
      
      case OAuthProvider.GITHUB:
        return {
          id: userData.id.toString(),
          email: userData.email,
          name: userData.name || userData.login,
          firstName: userData.name?.split(' ')[0],
          lastName: userData.name?.split(' ').slice(1).join(' '),
          avatar: userData.avatar_url,
          provider,
        };
      
      default:
        throw new BadRequestException(`Unsupported OAuth provider: ${provider}`);
    }
  }

  private getOAuthConfig(provider: OAuthProvider): OAuthConfig {
    const baseConfig = {
      clientId: this.configService.get(`OAUTH_${provider.toUpperCase()}_CLIENT_ID`),
      clientSecret: this.configService.get(`OAUTH_${provider.toUpperCase()}_CLIENT_SECRET`),
      redirectUri: this.configService.get(`OAUTH_${provider.toUpperCase()}_REDIRECT_URI`),
    };

    if (!baseConfig.clientId || !baseConfig.clientSecret) {
      throw new BadRequestException(`OAuth ${provider} not configured`);
    }

    const providerConfigs = {
      [OAuthProvider.GOOGLE]: {
        ...baseConfig,
        scope: 'openid email profile',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      },
      [OAuthProvider.MICROSOFT]: {
        ...baseConfig,
        scope: 'https://graph.microsoft.com/user.read',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      },
      [OAuthProvider.GITHUB]: {
        ...baseConfig,
        scope: 'user:email',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
      },
    };

    return providerConfigs[provider];
  }

  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // These methods would typically interact with a database
  // For demo purposes, using in-memory storage
  private oauthAccounts = new Map<string, Map<OAuthProvider, any>>();

  private async findUserByOAuthProvider(provider: OAuthProvider, providerId: string): Promise<string | null> {
    // In a real implementation, this would query the database
    for (const [userId, userAccounts] of this.oauthAccounts.entries()) {
      const account = userAccounts.get(provider);
      if (account && account.providerId === providerId) {
        return userId;
      }
    }
    return null;
  }

  private async storeOAuthAccount(userId: string, provider: OAuthProvider, accountData: any): Promise<void> {
    if (!this.oauthAccounts.has(userId)) {
      this.oauthAccounts.set(userId, new Map());
    }
    
    const userAccounts = this.oauthAccounts.get(userId)!;
    userAccounts.set(provider, {
      ...accountData,
      linkedAt: new Date(),
    });
  }

  private async removeOAuthAccount(userId: string, provider: OAuthProvider): Promise<void> {
    const userAccounts = this.oauthAccounts.get(userId);
    if (userAccounts) {
      userAccounts.delete(provider);
    }
  }

  private async getOAuthAccount(userId: string, provider: OAuthProvider): Promise<any> {
    const userAccounts = this.oauthAccounts.get(userId);
    return userAccounts?.get(provider) || null;
  }

  private async updateOAuthTokens(
    userId: string,
    provider: OAuthProvider,
    tokens: { accessToken: string; refreshToken: string; expiresAt: Date }
  ): Promise<void> {
    const account = await this.getOAuthAccount(userId, provider);
    if (account) {
      Object.assign(account, tokens, { updatedAt: new Date() });
    }
  }
}