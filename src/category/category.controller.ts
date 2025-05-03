import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
@ApiTags('Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto.name, dto.parentId);
  }

  @Get('tree')
  getTree() {
    return this.categoryService.getTree();
  }

  @Get(':id/children')
  getChildren(@Param('id') id: number) {
    return this.categoryService.getChildren(id);
  }

  @Get(':id/parents')
  getParent(@Param('id') id: number) {
    return this.categoryService.getParent(id);
  }


  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.delete(id);
  }
}
