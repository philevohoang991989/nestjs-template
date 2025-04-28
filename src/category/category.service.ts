import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }
  async create(createCategoryDto: CreateCategoryDto) {
    const { name, parentId } = createCategoryDto;

    let parent: Category = null;
    if (parentId) {
      parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent category with id ${parentId} not found`,
        );
      }
    }

    const category = this.categoryRepository.create({
      name,
      parent,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      relations: ['children'],
      order: { id: 'ASC' },
    });

    // Bước 1: Tìm tất cả các id xuất hiện trong children
    const childIds = new Set<number>();
    categories.forEach((category) => {
      category.children?.forEach((child) => {
        childIds.add(child.id);
      });
    });

    // Bước 2: Chỉ giữ lại các category mà id KHÔNG nằm trong childIds
    const rootCategories = categories.filter(
      (category) => !childIds.has(category.id),
    );

    return rootCategories;
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    await this.categoryRepository.delete(id);
  }
}
