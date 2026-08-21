import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PageStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto, ReplacePageTreeDto, UpdatePageDto } from './dto/page.dto';
import { validateBlockData } from './block-schemas';

const pageTreeInclude = {
  rows: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      columns: {
        orderBy: { sortOrder: 'asc' as const },
        include: {
          blocks: {
            orderBy: { sortOrder: 'asc' as const },
            include: { media: true },
          },
        },
      },
    },
  },
};

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lecture publique : uniquement les pages publiées. */
  async findPublishedBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: pageTreeInclude,
    });
    if (!page || page.status !== PageStatus.published) {
      throw new NotFoundException('Page introuvable');
    }
    return page;
  }

  findAllForAdmin() {
    return this.prisma.page.findMany({ orderBy: { title: 'asc' } });
  }

  findOneForAdmin(id: string) {
    return this.prisma.page.findUniqueOrThrow({
      where: { id },
      include: pageTreeInclude,
    });
  }

  create(dto: CreatePageDto) {
    return this.prisma.page.create({ data: dto });
  }

  update(id: string, dto: UpdatePageDto) {
    return this.prisma.page.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.page.delete({ where: { id } });
    return { id };
  }

  /**
   * Remplace tout l'arbre rangées/colonnes/blocs d'une page en une
   * transaction : c'est ce que l'éditeur de pages envoie à chaque
   * sauvegarde (l'état complet, pas un diff).
   */
  async replaceTree(pageId: string, dto: ReplacePageTreeDto) {
    // Valide chaque bloc selon son type avant toute écriture en base.
    for (const row of dto.rows) {
      for (const column of row.columns) {
        for (const block of column.blocks) {
          try {
            block.data = validateBlockData(block.type, block.data);
          } catch (error) {
            throw new BadRequestException(
              error instanceof Error ? error.message : 'Bloc invalide',
            );
          }
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.page.findUniqueOrThrow({ where: { id: pageId } });
      await tx.pageRow.deleteMany({ where: { pageId } });

      for (const [rowIndex, row] of dto.rows.entries()) {
        const createdRow = await tx.pageRow.create({
          data: {
            pageId,
            sortOrder: rowIndex,
            settings: (row.settings ?? {}) as Prisma.InputJsonValue,
          },
        });

        for (const [colIndex, column] of row.columns.entries()) {
          const createdColumn = await tx.pageColumn.create({
            data: {
              rowId: createdRow.id,
              sortOrder: colIndex,
              width: column.width,
              settings: (column.settings ?? {}) as Prisma.InputJsonValue,
            },
          });

          for (const [blockIndex, block] of column.blocks.entries()) {
            await tx.pageBlock.create({
              data: {
                columnId: createdColumn.id,
                sortOrder: blockIndex,
                type: block.type,
                data: block.data as Prisma.InputJsonValue,
                mediaId: block.mediaId,
              },
            });
          }
        }
      }

      return tx.page.findUniqueOrThrow({
        where: { id: pageId },
        include: pageTreeInclude,
      });
    });
  }
}
