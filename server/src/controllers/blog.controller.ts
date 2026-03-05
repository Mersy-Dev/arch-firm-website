import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/blog — paginated published posts with optional filters
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const page     = Math.max(1, Number(req.query.page)  || 1);
  const limit    = Math.min(50, Number(req.query.limit) || 10);
  const skip     = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'published' };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag)      filter.tags      = req.query.tag;
  if (req.query.featured) filter.isFeatured = req.query.featured === 'true';

  // Simple keyword search across title + excerpt
  if (req.query.search) {
    const regex = new RegExp(String(req.query.search), 'i');
    filter.$or = [{ title: regex }, { excerpt: regex }];
  }

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatar')
      .select('-content -__v'), // exclude heavy content field from list view
    BlogPost.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }, 'Blog posts fetched successfully')
  );
});

// GET /api/blog/featured — up to 3 featured published posts
export const getFeaturedPosts = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await BlogPost.find({ status: 'published', isFeatured: true })
    .sort({ publishedAt: -1 })
    .limit(3)
    .populate('author', 'name avatar')
    .select('-content -__v');

  res.status(200).json(new ApiResponse(200, posts, 'Featured posts fetched successfully'));
});

// GET /api/blog/categories — distinct category list
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await BlogPost.distinct('category', { status: 'published' });
  res.status(200).json(new ApiResponse(200, categories, 'Categories fetched successfully'));
});

// GET /api/blog/tags — distinct tags list
export const getTags = asyncHandler(async (_req: Request, res: Response) => {
  const tags = await BlogPost.distinct('tags', { status: 'published' });
  res.status(200).json(new ApiResponse(200, tags, 'Tags fetched successfully'));
});

// GET /api/blog/:slug — single published post + increment views
export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'name avatar')
    .select('-__v');

  if (!post) throw new ApiError(404, 'Blog post not found');

  res.status(200).json(new ApiResponse(200, post, 'Blog post fetched successfully'));
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/blog/admin/all — all posts (any status) with pagination
export const getAdminPosts = asyncHandler(async (req: Request, res: Response) => {
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const skip  = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name avatar')
      .select('-content -__v'),
    BlogPost.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    }, 'All blog posts fetched successfully')
  );
});

// GET /api/blog/admin/:id — single post by ID (full content)
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findById(req.params.id)
    .populate('author', 'name avatar')
    .select('-__v');

  if (!post) throw new ApiError(404, 'Blog post not found');
  res.status(200).json(new ApiResponse(200, post, 'Blog post fetched successfully'));
});

// POST /api/blog — create new post
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const {
    title, excerpt, content, category,
    tags, status, isFeatured, metaTitle, metaDescription,
  } = req.body;

  // Duplicate title check
  const existing = await BlogPost.findOne({ title });
  if (existing) throw new ApiError(409, 'A blog post with this title already exists');

  // ── Cover image upload ──
  let coverImage: string | undefined;

  if (req.file?.buffer) {
    coverImage = await uploadToCloudinary(req.file.buffer, 'forma/blog');
  } else if (req.body.coverImage) {
    coverImage = req.body.coverImage;
  }

  if (!coverImage) throw new ApiError(400, 'Cover image is required');

  const post = await BlogPost.create({
    title,
    excerpt,
    content,
    coverImage,
    category,
    tags:        Array.isArray(tags)  ? tags  : JSON.parse(tags ?? '[]'),
    status:      status    ?? 'draft',
    isFeatured:  isFeatured === 'true' || isFeatured === true,
    metaTitle:   metaTitle    ?? title,
    metaDescription: metaDescription ?? excerpt,
    author:      req.user!._id,  // set by auth middleware
  });

  res.status(201).json(new ApiResponse(201, post, 'Blog post created successfully'));
});

// PUT /api/blog/:id — full update
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await BlogPost.findById(id);
  if (!post) throw new ApiError(404, 'Blog post not found');

  // Duplicate title check (skip if unchanged)
  if (req.body.title && req.body.title !== post.title) {
    const dup = await BlogPost.findOne({ title: req.body.title });
    if (dup) throw new ApiError(409, 'A blog post with this title already exists');
  }

  // ── Cover image swap ──
  if (req.file?.buffer) {
    if (post.coverImage?.includes('cloudinary.com')) {
      await deleteFromCloudinary(post.coverImage).catch(() => {});
    }
    req.body.coverImage = await uploadToCloudinary(req.file.buffer, 'forma/blog');
  }

  // Parse tags if sent as JSON string (multipart)
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    req.body.tags = JSON.parse(req.body.tags);
  }

  // Coerce isFeatured string → boolean
  if (typeof req.body.isFeatured === 'string') {
    req.body.isFeatured = req.body.isFeatured === 'true';
  }

  const updated = await BlogPost.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  )
    .populate('author', 'name avatar')
    .select('-__v');

  res.status(200).json(new ApiResponse(200, updated, 'Blog post updated successfully'));
});

// PATCH /api/blog/:id/status — change status (draft ↔ published ↔ archived)
export const updatePostStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: 'draft' | 'published' | 'archived' };

  if (!['draft', 'published', 'archived'].includes(status)) {
    throw new ApiError(400, 'Invalid status value');
  }

  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Blog post not found');

  post.status = status;
  if (status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date();
  }
  await post.save();

  res.status(200).json(new ApiResponse(200, post, `Post status updated to "${status}"`));
});

// PATCH /api/blog/:id/feature — toggle featured flag
export const toggleFeatured = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new ApiError(404, 'Blog post not found');

  post.isFeatured = !post.isFeatured;
  await post.save();

  res.status(200).json(
    new ApiResponse(200, post, `Post ${post.isFeatured ? 'marked as' : 'removed from'} featured`)
  );
});

// DELETE /api/blog/:id
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) throw new ApiError(404, 'Blog post not found');

  if (post.coverImage?.includes('cloudinary.com')) {
    await deleteFromCloudinary(post.coverImage).catch(() => {});
  }

  res.status(200).json(new ApiResponse(200, null, 'Blog post deleted successfully'));
});