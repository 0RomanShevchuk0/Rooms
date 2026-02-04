import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Room } from 'generated/prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  createRoom(createRoomDto: CreateRoomDto) {
    const partisipants = (createRoomDto.participantIds || []).map(
      (id: string) => ({ id }),
    );
    return this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        participants: {
          connect: partisipants,
        },
      },
      include: {
        participants: true,
      },
    });
  }

  queryRooms(): Promise<Room[]> {
    return this.prisma.room.findMany({ include: { participants: true } });
  }

  findRoom(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: { participants: true },
    });
  }

  update(id: string, updateRoomDto: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: { participants: true },
    });
  }

  remove(id: string) {
    return this.prisma.room.delete({
      where: { id },
    });
  }
}
