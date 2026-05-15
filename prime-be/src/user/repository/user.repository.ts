import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CommonDrizzleService } from 'src/drizzle/common.drizzle.service';
import { and, eq } from 'drizzle-orm';
import * as schema from 'src/drizzle/schema-common/schema';
import { InsertUserBySocialInput, toInsertUserBySocialData, toUpdateUserBySocialProvider } from '../interface/user.interface';
import { SocialProvider } from "src/auth/interface/auth.interface";
import { SignUpReq } from '../dto/user-req.dto';

@Injectable()
export class UserRepository{
    constructor(private readonly drizzleCommonService: CommonDrizzleService){}
    
    async getUserById(userId: number){
        const result = await this.drizzleCommonService.commonDrizzleDatabase
        .select().from(schema.user).where(
            and(
                eq(schema.user.id, userId),
                eq(schema.user.status, 1)
            )
        ).limit(1).catch(err => {
            console.log(err);
            throw new InternalServerErrorException("Get User Info Error");
        });
        return result
    }


    async getUserByEmail(email: string){
        const result = await this.drizzleCommonService.commonDrizzleDatabase
        .select().from(schema.user).where(
            and(
                eq(schema.user.email, email),
                eq(schema.user.status, 1)
            )
        ).limit(1).catch(err => {
            console.log(err);
            throw new InternalServerErrorException("Get User Info Error");
        });
        return result
    }

    async getUserInfo(email: string, password:string){
        const result = await this.drizzleCommonService.commonDrizzleDatabase
        .select().from(schema.user).where(
            and(
                eq(schema.user.email, email),
                eq(schema.user.password, password),
                eq(schema.user.status, 1)
            )
        ).limit(1).catch(err => {
            console.log(err);
            throw new InternalServerErrorException("Get User Info Error");
        });
        return result
    }

    async insertUserBySocial(inputData: InsertUserBySocialInput): Promise<number> {
        const insertData = toInsertUserBySocialData(inputData);
        await this.drizzleCommonService.commonDrizzleDatabase
        .insert(schema.user).values(insertData).catch(err => {
            console.log(err);
            throw new InternalServerErrorException("Insert User by Social Error");
        });
        

        const createdUser = await this.getUserByEmail(inputData.email);
        if (!createdUser || createdUser.length === 0) {
            throw new Error('Failed to resolve created social user');
        }

        return createdUser[0].id;
    }

    async insertUserBySignUp(inputData: SignUpReq){
        await this.drizzleCommonService.commonDrizzleDatabase
        .insert(schema.user).values({
            email: inputData.email,
            password: inputData.password,
            phone: inputData.phone ?? null,
            gender: inputData.gender ?? null,
            name: inputData.name ?? null,
            personalEmail: 1,
        } as any).catch(err => {
            console.log(err);
            throw new InternalServerErrorException("Insert User Service Error");
        });
    }

    async updateUserBySocial(id: number, provider: SocialProvider){
        const updateData = toUpdateUserBySocialProvider(provider)
        await this.drizzleCommonService.commonDrizzleDatabase
        .update(schema.user)
        .set(updateData as any)
        .where(eq(schema.user.id, id)).catch(err => {
            console.log(err);
            throw new InternalServerErrorException("Update User Social boolean Error");
        });
    }
}
