import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories() {
    return this.prisma.category.findMany();
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: slug,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const dataToUpdate: any = {};
    if (dto.name) {
      dataToUpdate.name = dto.name;
      dataToUpdate.slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    return this.prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
