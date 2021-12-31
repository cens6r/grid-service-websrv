import { Request, Response } from 'express';
import { Convert } from 'Assemblies/Util/Convert';
import { BaseURL } from 'Assemblies/Util/BaseUrl';
import { KeyValueMapping } from 'Assemblies/Util/KeyValueMapping';
import { CachePolicy } from 'Assemblies/Caching/Enumeration/CachePolicy';
import { MemoryBackedByFileSystemCacheRepository } from 'Assemblies/Caching/MemoryBackedByFileSystemCacheRepository';
import { ClientRequest } from 'Assemblies/HttpServiceClient/Models/ClientRequest';
import { HttpRequestMethodEnum } from 'Assemblies/HttpServiceClient/Enumeration/HttpRequestMethodEnum';
import { HttpClient } from 'Assemblies/HttpServiceClient/HttpClient';

interface BodyColorsModel {
    headColorId: int;
    torsoColorId: int;
    rightArmColorId: int;
    leftArmColorId: int;
    rightLegColorId: int;
    leftLegColorId: int;
}

export interface AvatarFetchRequest {
    PlaceID: long;
    UserID: long;
    UserName: string;
}

export interface AvatarFetchModel {
    resolvedAvatarType: 'R6' | 'R15';
    equippedGearVersionIds: long[];
    backpackGearVersionIds: long[];
    assetAndAssetTypeIds: AssetIdAndTypeModel[];
    animationAssetIds: any;
    bodyColors: BodyColorsModel;
    scales: AvatarScalingModel;
    emotes: EmoteModel[];
}

interface AvatarBodyColorsModel {
    HeadColor: int;
    LeftArmColor: int;
    LeftLegColor: int;
    RightArmColor: int;
    RightLegColor: int;
    TorsoColor: int;
}

interface GetByUserNameResponse {
    Success?: bool;
    ErrorMessage?: string;
    ID: long;
    Username: string;
    AvatarURI?: null;
    AvatarFinal: bool;
    IsOnline: bool;
}

interface AvatarScalingModel {
    width: float;
    height: float;
    head: float;
    depth: float;
    proportion: float;
    bodyType: float;
}

interface AvatarBodyColorsModel {
    HeadColor: int;
    LeftArmColor: int;
    LeftLegColor: int;
    RightArmColor: int;
    RightLegColor: int;
    TorsoColor: int;
}

interface AssetIdAndTypeModel {
    assetId: long;
    assetTypeId: long;
}

interface EmoteModel {
    assetId: long;
    assetName: string;
    position: int;
}

interface Legacy2AvatarFetchModel {
    resolvedAvatarType: 'R6' | 'R15';
    equippedGearVersionIds: long[];
    backpackGearVersionIds: long[];
    assetAndAssetTypeIds: AssetIdAndTypeModel[];
    animationAssetIds: any;
    bodyColors: AvatarBodyColorsModel;
    scales: AvatarScalingModel;
    emotes: EmoteModel[];
}

/* TODO: Actually cache this... It takes an average of 200ms to execute each request. */

export class AvatarRequestProcessor {
    /* Constants */
    private static readonly GLOBAL_CONFIG: ClientRequest = {
        Method: HttpRequestMethodEnum.GET,
    };
    private static readonly API_PROXY_GET_BY_USERNAME = BaseURL.ConstructServicePathFromHostSimple(
        'api.roblox.com',
        'users/get-by-username',
        true,
    );

    private static readonly AVATAR_API_SITE_AVATAR_FETCH = BaseURL.ConstructServicePathFromHostSimple(
        'avatar.roblox.com',
        'v1/avatar-fetch',
        true,
    );

    // private static readonly API_PROXY_AVATAR_FETCH = BaseURL.ConstructServicePathFromHostSimple(
    // 	'api.roblox.com',
    // 	`v1.1/avatar-fetch`,
    // 	true,
    // );

    private static FUNNY_AVATAR_FETCH_MODEL: Legacy2AvatarFetchModel = {
        resolvedAvatarType: 'R15',
        equippedGearVersionIds: [],
        backpackGearVersionIds: [],
        assetAndAssetTypeIds: [
            { assetId: 4487955592, assetTypeId: 43 },
            { assetId: 5917459717, assetTypeId: 18 },
            { assetId: 5617784770, assetTypeId: 2 },
            { assetId: 6372437047, assetTypeId: 12 },
        ],
        animationAssetIds: { climb: 837013990, run: 837009922, jump: 619528412, fall: 619527817, idle: 1018553897, walk: 754636298 },
        bodyColors: {
            HeadColor: 1,
            TorsoColor: 1,
            RightArmColor: 1,
            LeftArmColor: 1,
            RightLegColor: 1,
            LeftLegColor: 1,
        },
        scales: { height: 0.5, width: 3.0, head: 1.0, depth: 1.0, proportion: 0.0, bodyType: 0.05 },
        emotes: [
            { assetId: 3576686446, assetName: 'Hello', position: 1 },
            { assetId: 3360689775, assetName: 'Salute', position: 2 },
            { assetId: 3360692915, assetName: 'Tilt', position: 3 },
        ],
    };

    private static FUNNY_AVATAR_FETCH_MODEL_NEW: AvatarFetchModel = {
        resolvedAvatarType: 'R15',
        equippedGearVersionIds: [],
        backpackGearVersionIds: [],
        assetAndAssetTypeIds: [
            { assetId: 4487955592, assetTypeId: 43 },
            { assetId: 5917459717, assetTypeId: 18 },
            { assetId: 5617784770, assetTypeId: 2 },
            { assetId: 6372437047, assetTypeId: 12 },
        ],
        animationAssetIds: { climb: 837013990, run: 837009922, jump: 619528412, fall: 619527817, idle: 1018553897, walk: 754636298 },
        bodyColors: {
            headColorId: 1,
            torsoColorId: 1,
            rightArmColorId: 1,
            leftArmColorId: 1,
            rightLegColorId: 1,
            leftLegColorId: 1,
        },
        scales: { height: 0.5, width: 3.0, head: 1.0, depth: 1.0, proportion: 0.0, bodyType: 0.05 },
        emotes: [
            { assetId: 3576686446, assetName: 'Hello', position: 1 },
            { assetId: 3360689775, assetName: 'Salute', position: 2 },
            { assetId: 3360692915, assetName: 'Tilt', position: 3 },
        ],
    };

    private static DEFAULT_AVATAR_FETCH_MODEL: Legacy2AvatarFetchModel = AvatarRequestProcessor.FUNNY_AVATAR_FETCH_MODEL; /*{
		resolvedAvatarType: 'R15',
		equippedGearVersionIds: [],
		backpackGearVersionIds: [],
		assetAndAssetTypeIds: [
			{ assetId: 6395566584, assetTypeId: 2 },
			{ assetId: 11844853, assetTypeId: 8 },
			{ assetId: 19380685, assetTypeId: 42 },
		],
		animationAssetIds: { climb: 837013990, run: 837009922, jump: 619528412, fall: 619527817, idle: 754637456, walk: 754636298 },
		bodyColors: {
			HeadColor: 105,
			TorsoColor: 1003,
			RightArmColor: 105,
			LeftArmColor: 105,
			RightLegColor: 1004,
			LeftLegColor: 1004,
		},
		scales: { height: 1.0, width: 1.0, head: 1.0, depth: 1.0, proportion: 0.0, bodyType: 0.05 },
		emotes: [
			{ assetId: 3576686446, assetName: 'Hello', position: 1 },
			{ assetId: 3360689775, assetName: 'Salute', position: 2 },
			{ assetId: 3360692915, assetName: 'Tilt', position: 3 },
		],
	};*/

    private static DEFAULT_AVATAR_FETCH_MODEL_NEW: AvatarFetchModel = AvatarRequestProcessor.FUNNY_AVATAR_FETCH_MODEL_NEW; /*{
		resolvedAvatarType: 'R15',
		equippedGearVersionIds: [],
		backpackGearVersionIds: [],
		assetAndAssetTypeIds: [
			{ assetId: 6395566584, assetTypeId: 2 },
			{ assetId: 11844853, assetTypeId: 8 },
			{ assetId: 19380685, assetTypeId: 42 },
		],
		animationAssetIds: { climb: 837013990, run: 837009922, jump: 619528412, fall: 619527817, idle: 754637456, walk: 754636298 },
		bodyColors: {
			headColorId: 105,
			torsoColorId: 1003,
			rightArmColorId: 105,
			leftArmColorId: 105,
			rightLegColorId: 1004,
			leftLegColorId: 1004,
		},
		scales: { height: 1.0, width: 1.0, head: 1.0, depth: 1.0, proportion: 0.0, bodyType: 0.05 },
		emotes: [
			{ assetId: 3576686446, assetName: 'Hello', position: 1 },
			{ assetId: 3360689775, assetName: 'Salute', position: 2 },
			{ assetId: 3360692915, assetName: 'Tilt', position: 3 },
		],
	};*/

    /* Mutable Data */

    private placeID: long = undefined;
    private userID: long = undefined;
    private userName: string = null;

    /* Usable private members */
    private readonly _response: Response;
    private readonly _cachedClient: HttpClient;

    public constructor(response: Response) {
        this._response = response;
        this._cachedClient = new HttpClient(AvatarRequestProcessor.GLOBAL_CONFIG);
    }

    public static get IsCacheCleared() {
        return (
            AvatarRequestProcessor.UsernameCacheRepo.IsCacheClear &&
            AvatarRequestProcessor.Legacy2CharacterFetchCacheRepo.IsCacheClear &&
            AvatarRequestProcessor.QueriedCharacterFetchCacheRepo.IsCacheClear
        );
    }

    public ExtractDataFromQueryStringForGetAvatarFetchRequest(request: Request): [ulong, string, ulong] {
        const UserID = KeyValueMapping.FetchKeyFromObjectCaseInsensitive<long>(request.query, 'UserID');
        const UserName = KeyValueMapping.FetchKeyFromObjectCaseInsensitiveOrDefault<string>(request.query, 'UserName', null);
        const PlaceID = KeyValueMapping.FetchKeyFromObjectCaseInsensitiveOrDefault<long>(request.query, 'PlaceID', 1818);
        return [Convert.ToUInt64(UserID), UserName, Convert.ToUInt64(PlaceID)];
    }

    public async GetAvatarFetchResponseAsync(userID: long, userName: string, placeID: long) {
        if (userID === 4) return this._response.send(AvatarRequestProcessor.FUNNY_AVATAR_FETCH_MODEL);
        if (typeof userName === 'string') userName = userName.toLowerCase().trim();
        this.UpdateConfiguredMutablesV2(userID, userName, placeID);
        await this.TryUpdateUserIDByUserName();
        const key = `Avatars_Legacy2AvatarFetchModel:${this.userID}:${this.userName}:${this.placeID}`;
        const [isCached, cachedValue] =
            AvatarRequestProcessor.Legacy2CharacterFetchCacheRepo.GetCachedValueJson<Legacy2AvatarFetchModel>(key);

        if (isCached) return this._response.send(cachedValue);
        return this._response.send(await this.GetAvatarResponseModelAsync());
    }

    /* UTIL */

    private async ClearCacheAsync() {
        await this._cachedClient.ClearCacheAsync();
    }

    private async ClearConfigAndCacheAsync() {
        this._cachedClient.ClearConfiguration();
        await this.ClearCacheAsync();
    }

    private UpdateConfiguredMutablesV2(userID: number, userName: string, placeID: long) {
        this.userID = userID;
        this.userName = userName;
        this.placeID = placeID;
    }

    private async TryUpdateUserIDByUserName() {
        if (this.userName) {
            if (this.TryUpdateUserIDFromCache()) return;

            this.UpdateConfigForUsernameFetch();
            await this.TryGetUsernameFromUserIDAsync();
            await this.ClearConfigAndCacheAsync();
        }
    }

    private TryUpdateUserIDFromCache() {
        const collectionId = `Users_TryUpdateUserIDByUserName:${this.userName}`;

        const [cached, cachedValue] = AvatarRequestProcessor.UsernameCacheRepo.GetCachedValueNumber(collectionId);

        if (cached) {
            if (cachedValue !== null) this.userID = cachedValue;
            return true;
        }
        return false;
    }

    private async TryGetUsernameFromUserIDAsync() {
        const collectionId = `Users_TryUpdateUserIDByUserName:${this.userName}`;
        const [WasSuccessful, CachedResponse] = await this._cachedClient.ExecuteAsync<GetByUserNameResponse>();

        const WasRemotelySuccessful = KeyValueMapping.FetchKeyFromObjectCaseInsensitive<bool>(CachedResponse.ResponsePayload, 'Success');
        const RemoteUserID = KeyValueMapping.FetchKeyFromObjectCaseInsensitiveOrDefault<long>(CachedResponse.ResponsePayload, 'ID', null);

        AvatarRequestProcessor.UsernameCacheRepo.SetCachedValueNumber(collectionId, RemoteUserID);

        if (WasSuccessful && WasRemotelySuccessful !== false) {
            this.userID = RemoteUserID;
        } else {
            this.userName = null;
        }
    }

    private UpdateConfigForUsernameFetch() {
        this._cachedClient.UpdateConfiguration({
            ...AvatarRequestProcessor.GLOBAL_CONFIG,
            Url: AvatarRequestProcessor.API_PROXY_GET_BY_USERNAME,
            QueryString: { ...AvatarRequestProcessor.GLOBAL_CONFIG.QueryString, UserName: this.userName },
        });
    }

    private async GetAvatarFetchModelV2(): Promise<AvatarFetchModel> {
        if (this.userID) {
            const [WasCached, CachedModel] = AvatarRequestProcessor.QueriedCharacterFetchCacheRepo.GetCachedValueJson<AvatarFetchModel>(
                `Avatars_GetAvatarFetchResponseAsync:${this.userID}:${this.userName}:${this.placeID}`,
            );
            if (WasCached) return CachedModel;
            this.UpdateConfigForAvatarFetchRequestV2();
            return await this.ExecuteGetAvatarFetchAsyncV2();
        } else {
            return AvatarRequestProcessor.DEFAULT_AVATAR_FETCH_MODEL_NEW;
        }
    }

    private async ExecuteGetAvatarFetchAsyncV2(): Promise<AvatarFetchModel> {
        const key = `Avatars_GetAvatarFetchResponseAsync:${this.userID}:${this.userName}:${this.placeID}`;
        const [WasSuccessful, CachedAvatarResponse] = await this._cachedClient.ExecuteAsync<AvatarFetchModel>();

        if (!WasSuccessful) {
            AvatarRequestProcessor.QueriedCharacterFetchCacheRepo.SetCachedValueJson<AvatarFetchModel>(
                key,
                AvatarRequestProcessor.DEFAULT_AVATAR_FETCH_MODEL_NEW,
            );

            return AvatarRequestProcessor.DEFAULT_AVATAR_FETCH_MODEL_NEW;
        }

        AvatarRequestProcessor.QueriedCharacterFetchCacheRepo.SetCachedValueJson<AvatarFetchModel>(
            key,
            CachedAvatarResponse.ResponsePayload,
        );

        return CachedAvatarResponse.ResponsePayload;
    }

    private UpdateConfigForAvatarFetchRequestV2() {
        this._cachedClient.UpdateConfiguration({
            ...AvatarRequestProcessor.GLOBAL_CONFIG,
            Url: AvatarRequestProcessor.AVATAR_API_SITE_AVATAR_FETCH,
            QueryString: {
                ...AvatarRequestProcessor.GLOBAL_CONFIG.QueryString,
                UserID: this.userID,
                PlaceID: this.placeID,
            },
        });
    }

    private async GetAvatarResponseModelAsync() {
        const data = await this.GetAvatarFetchModelV2();

        if (data && !this.isEmptyObject(data)) {
            const response: Legacy2AvatarFetchModel = {
                ...data,
                bodyColors: {
                    TorsoColor: data.bodyColors.torsoColorId,
                    HeadColor: data.bodyColors.headColorId,
                    LeftArmColor: data.bodyColors.leftArmColorId,
                    RightArmColor: data.bodyColors.rightArmColorId,
                    LeftLegColor: data.bodyColors.leftLegColorId,
                    RightLegColor: data.bodyColors.rightLegColorId,
                },
            };

            AvatarRequestProcessor.Legacy2CharacterFetchCacheRepo.SetCachedValueJson<Legacy2AvatarFetchModel>(
                `Avatars_Legacy2AvatarFetchModel:${this.userID}:${this.userName}:${this.placeID}`,
                response,
            );

            return response;
        }

        return AvatarRequestProcessor.DEFAULT_AVATAR_FETCH_MODEL;
    }

    private isEmptyObject(obj: Object) {
        return !Object.keys(obj).length;
    }

    private static readonly UsernameCacheRepo: MemoryBackedByFileSystemCacheRepository = new MemoryBackedByFileSystemCacheRepository(
        'UsernameCacheRepo',
        CachePolicy.StaleAfterFifteenMinutes,
    );
    private static readonly QueriedCharacterFetchCacheRepo: MemoryBackedByFileSystemCacheRepository =
        new MemoryBackedByFileSystemCacheRepository('QueriedCharacterFetchCacheRepo', CachePolicy.StaleAfterOneMinute);
    private static readonly Legacy2CharacterFetchCacheRepo: MemoryBackedByFileSystemCacheRepository =
        new MemoryBackedByFileSystemCacheRepository('Legacy2CharacterFetchCacheRepo', CachePolicy.StaleAfterOneMinute);
}
