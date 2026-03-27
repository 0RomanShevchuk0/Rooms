import { PartialType } from '@nestjs/mapped-types';
import { CreateSnakeDto } from './create-snake.dto';

export class UpdateSnakeDto extends PartialType(CreateSnakeDto) {
  id: number;
}
