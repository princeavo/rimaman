import { useAsyncData } from './useAsyncData';
import { fetchBlogPostBySlug, fetchBlogPosts } from '../api/blog';

export const useBlogPosts = () => useAsyncData(fetchBlogPosts, []);

export const useBlogPost = (slug: string) =>
  useAsyncData(() => fetchBlogPostBySlug(slug), [slug]);
