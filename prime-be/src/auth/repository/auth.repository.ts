import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CommonDrizzleService } from 'src/drizzle/common.drizzle.service';
import * as schema from 'src/drizzle/schema-common/schema';
import { and, eq } from 'drizzle-orm';
import { OAuthClient } from "../interface/auth.interface";

@Injectable()
export class AuthRepository{
    constructor(private readonly drizzleCommonService: CommonDrizzleService){}

    async getSocialId(provider:string, socialId: string, client: string){
        const result = await this.drizzleCommonService.commonDrizzleDatabase
        .select().from(schema.socialAccount).where(
            and(
                eq(schema.socialAccount.provider, provider),
                eq(schema.socialAccount.socialId, socialId),
                eq(schema.socialAccount.client, client),
                eq(schema.socialAccount.status, 1)
            )
        ).limit(1).catch(err => {
            console.log(err);
            throw new InternalServerErrorException("Get social id check Error");
        });
        return result
    }
    
    async insertSocialAccount(userId:number, socialUserEmail:string, provider:string, socialId:string, client: OAuthClient){
        await this.drizzleCommonService.commonDrizzleDatabase
            .insert(schema.socialAccount)
            .values({userId, socialUserEmail, provider, socialId, client}).catch(err => {
                console.log(err);
                throw new InternalServerErrorException("Insert Social Account Error");
            });;;
    }
}
