import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategorysController } from './categorys.controller';
import { CategorysService } from './categorys.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])], // ✅ thêm dòng này
  controllers: [CategorysController],
  providers: [CategorysService],
  exports: [CategorysService], // optional: nếu module khác dùng
})
export class CategorysModule { }
