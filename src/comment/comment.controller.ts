import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrectUser } from 'src/common/decorators/userCurrect.decorator';
import { updateCommentDto } from './dto/update-comment.dto';
import { QueryVideoFindALl } from './dto/query';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrectUser() userId: string, @Body() body: CreateCommentDto) {
    console.log(body);
    return this.commentService.create(userId, body);
  }

  @Post('/like')
  @UseGuards(AuthGuard)
  like(@CurrectUser() userId: string, @Body() body: { commentId: string }) {
    return this.commentService.like(userId, body);
  }

  @Get()
  findAll(@Query() query: QueryVideoFindALl) {
    return this.commentService.findAll(query);
  }

  @Patch()
  @UseGuards(AuthGuard)
  update(
    @CurrectUser() userId: string,
    @Body() updateCommentDto: updateCommentDto,
  ) {
    return this.commentService.update(userId, updateCommentDto);
  }

  @Delete()
  @UseGuards(AuthGuard)
  remove(@CurrectUser() userId: string, @Body() body: { id: string }) {
    return this.commentService.remove(userId, body.id);
  }
}
