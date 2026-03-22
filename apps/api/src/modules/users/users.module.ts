import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PasswordsModule } from '../auth/passwords.module';
import { SelfUserGuard } from './guards/self-user.guard';
@Module({
	imports: [PrismaModule, PasswordsModule],
	controllers: [UsersController],
	providers: [UsersService, SelfUserGuard],
	exports: [UsersService],
})
export class UsersModule {}
