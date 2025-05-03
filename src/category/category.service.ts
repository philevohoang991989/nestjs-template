import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
  ) { }
  async create(name: string, parentId?: number) {
    const category = new Category();
    category.name = name;

    if (parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }


  async getTree(): Promise<Category[]> {
    return this.categoryRepository.findTrees();
  }

  async getChildren(id: number): Promise<Category[]> {
    const parent = await this.categoryRepository.findOne({
      where: { id },
    });
    return this.categoryRepository.findDescendants(parent);
  }

  async getParent(id: number): Promise<Category[]> {
    const node = await this.categoryRepository.findOne({
      where: { id },
    });
    return this.categoryRepository.findAncestors(node);
  }
  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new Error('Category not found');

    if (dto.name) {
      category.name = dto.name;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        category.parent = null;
      } else {
        const newParent = await this.categoryRepository.findOne({ where: { id: dto.parentId } });
        if (!newParent) throw new Error('Parent category not found');
        category.parent = newParent;
      }
    }

    return this.categoryRepository.save(category);
  }

  async delete(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
      withDeleted: false, // chỉ lấy các bản ghi chưa bị xóa
    });

    if (!category) {
      throw new Error('Category not found');
    }

    for (const child of category.children) {
      child.parent = category.parent ?? null;
      await this.categoryRepository.save(child);
    }

    await this.categoryRepository.softRemove(category); // soft delete
  }

}
