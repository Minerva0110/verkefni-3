import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Category = {
  id: number;
  slug: string;
  title: string;
};

/**
 * Skilar lista af flokkum með síðu skiptingu.
 * @param limit - Hámark fjöldi flokka sem við viljum fá.
 * @param offset - Fjöldi flokka til að sleppa (fyrir síðu skiptingu).
 */
export async function getCategories(limit: number = 10, offset: number = 0): Promise<Category[]> {
  return await prisma.category.findMany({
    skip: offset,
    take: limit,
  });
}

/**
 * Skilar einum flokki út frá slug.
 * @param slug - Slug sem auðkennir flokkið.
 */
export async function getCategory(slug: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { slug },
  });
}

/**
 * Býr til nýjan flokk og skilar honum.
 * @param data - Hlutur sem inniheldur slug og titil.
 */
export async function createCategory(data: { slug: string; title: string }): Promise<Category> {
  return await prisma.category.create({
    data,
  });
}

/**
 * Uppfærir tiltekinn flokk.
 * @param slug - Slug flokksins sem við viljum uppfæra.
 * @param updateData - Hlutur með þeim gögnum sem á að breyta.
 * @returns Uppfærður flokkur, eða null ef hann finnst ekki.
 */
export async function updateCategory(slug: string, updateData: Partial<{ slug: string; title: string }>): Promise<Category | null> {
  try {
    return await prisma.category.update({
      where: { slug },
      data: updateData,
    });
  } catch {
    return null;
  }
}

/**
 * Eyðir flokki.
 * @param slug - Slug flokksins sem á að eyða.
 * @returns True ef eyðing gekk, annars false.
 */
export async function deleteCategory(slug: string): Promise<boolean> {
  try {
    await prisma.category.delete({
      where: { slug },
    });
    return true;
  } catch {
    return false;
  }
}
