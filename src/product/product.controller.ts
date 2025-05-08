import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('product')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 5 }, // upload nhiều ảnh
      ],
      {
        storage: diskStorage({
          destination: './uploads/products', // thư mục lưu ảnh
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
  ) {
    const imagePaths = files?.images?.map(
      (file) => `/uploads/products/${file.filename}`,
    );
    return this.productService.create({
      ...createProductDto,
      images: imagePaths || [],
    });
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
