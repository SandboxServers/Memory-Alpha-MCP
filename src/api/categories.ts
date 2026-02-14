import { apiRequest } from './client.js';
import type { CategoryMember, CategoryMembersResponse } from './types.js';

export async function getCategoryMembers(category: string, limit = 20): Promise<CategoryMember[]> {
  const categoryTitle = category.startsWith('Category:') ? category : `Category:${category}`;
  const data = await apiRequest<CategoryMembersResponse>({
    action: 'query',
    list: 'categorymembers',
    cmtitle: categoryTitle,
    cmlimit: String(limit),
    cmnamespace: '0',
    cmprop: 'ids|title',
  });
  return data.query.categorymembers;
}
