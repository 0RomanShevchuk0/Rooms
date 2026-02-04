import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUser(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async queryUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const rooms = (createUserDto.roomsIds || []).map((id: string) => ({ id }));
    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        rooms: {
          connect: rooms,
        },
      },
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
