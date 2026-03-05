import type { NextFunction, Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import Project from '../models/Project.model';
import { CONSTANTS } from '../config/constants';

// --- Typed param shapes: fixes Express 5 "string | string[]" on req.params ---
type IdParam         = { id: string };
type IdPublicIdParam = { id: string; publicId: string };

// ─── Helper: stream buffer → Cloudinary ───────────────────────────────────

interface CloudinaryResult {
  secure_url: string;
  public_id:  string;
}

function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  options: Record<string, unknown> = {}
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        ...options,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ─── GET /projects  (paginated list with filters) ─────────────────────────

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const {
    page      = '1',
    limit     = String(CONSTANTS.DEFAULT_PAGE_SIZE),
    type,
    published,
    featured,
    search,
    sortBy    = 'createdAt',
    order     = 'desc',
  } = req.query as Record<string, string>;

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(parseInt(limit), CONSTANTS.MAX_PAGE_SIZE);
  const skip     = (pageNum - 1) * limitNum;

  // Build filter object
  const filter: Record<string, unknown> = {};
  if (type)                     filter.type      = type;
  if (published !== undefined)  filter.published  = published === 'true';
  if (featured  !== undefined)  filter.featured   = featured  === 'true';
  if (search)                   filter.$text      = { $search: search };

  const sortObj: Record<string, 1 | -1> = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean(),
    Project.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      projects,
      pagination: {
        page:       pageNum,
        limit:      limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext:    pageNum < Math.ceil(total / limitNum),
        hasPrev:    pageNum > 1,
      },
    }, 'Projects fetched')
  );
});

// ─── GET /projects/:id ────────────────────────────────────────────────────

export const getProjectById = asyncHandler(async (req: Request<IdParam>, res: Response) => {
  const project = await Project.findById(req.params.id).lean();
  if (!project) throw ApiError.notFound('Project not found');
  res.status(200).json(new ApiResponse(200, { project }, 'Project fetched'));
});

// ─── POST /projects ───────────────────────────────────────────────────────
// Expects: multipart/form-data
//   - coverImage: single file  (required)
//   - images:     multiple files (optional)
//   - ...all text fields as JSON string in `data` field OR as flat fields

export const createProject = asyncHandler(async (req: Request<IdParam>, res: Response) => {
  const files = req.files as {
    coverImage?: Express.Multer.File[];
    images?:     Express.Multer.File[];
  };

  let body = req.body;
  if (typeof req.body.data === 'string') {
    body = JSON.parse(req.body.data);
  }

  // Upload file if provided, otherwise use URL from body
  let coverImage: { url: string; publicId: string };

  if (files?.coverImage?.[0]) {
    const cover = await uploadToCloudinary(files.coverImage[0].buffer, 'forma/projects/covers');
    coverImage = { url: cover.secure_url, publicId: cover.public_id };
  } else if (body.coverImage?.url && body.coverImage?.publicId) {
    coverImage = { url: body.coverImage.url, publicId: body.coverImage.publicId };
  } else {
    throw ApiError.badRequest('Cover image is required');
  }

  // Upload gallery images (if any)
  const galleryUploads = files?.images
    ? await Promise.all(files.images.map((f) => uploadToCloudinary(f.buffer, 'forma/projects/gallery')))
    : [];

  const galleryImages = galleryUploads.map((r, i) => ({
    url:      r.secure_url,
    publicId: r.public_id,
    caption:  files.images?.[i]?.originalname ?? '',
  }));

  // Use body.images as fallback if no files uploaded (for seeding)
  const images = galleryImages.length > 0 ? galleryImages : (body.images ?? []);

  const project = await Project.create({
    ...body,
    coverImage,
    images,
    completedAt: new Date(body.completedAt),
    materials: Array.isArray(body.materials)
      ? body.materials
      : (body.materials ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
    services: Array.isArray(body.services)
      ? body.services
      : (body.services ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
  });

  res.status(201).json(new ApiResponse(201, { project }, 'Project created'));
});





export const getProjectBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, published: true });
    if (!project) throw ApiError.notFound('Project not found');
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /projects/:id ──────────────────────────────────────────────────

export const updateProject = asyncHandler(async (req: Request<IdParam>, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const files = req.files as {
    coverImage?: Express.Multer.File[];
    images?:     Express.Multer.File[];
  };

  let body = req.body;
  if (typeof req.body.data === 'string') {
    body = JSON.parse(req.body.data);
  }

  // Replace cover image if a new one was uploaded
  if (files?.coverImage?.[0]) {
    // Delete old image from Cloudinary
    if (project.coverImage?.publicId) {
      await cloudinary.uploader.destroy(project.coverImage.publicId);
    }
    const cover = await uploadToCloudinary(
      files.coverImage[0].buffer,
      'forma/projects/covers'
    );
    body.coverImage = { url: cover.secure_url, publicId: cover.public_id };
  }

  // Append new gallery images if uploaded
  if (files?.images?.length) {
    const newUploads = await Promise.all(
      files.images.map((f) =>
        uploadToCloudinary(f.buffer, 'forma/projects/gallery')
      )
    );
    const newImages = newUploads.map((r) => ({
      url:      r.secure_url,
      publicId: r.public_id,
    }));
    body.images = [...(project.images ?? []), ...newImages];
  }

  // Handle array fields sent as comma-separated strings
  if (typeof body.materials === 'string') {
    body.materials = body.materials.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (typeof body.services === 'string') {
    body.services = body.services.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (body.completedAt) {
    body.completedAt = new Date(body.completedAt);
  }

  const updated = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: body },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, { project: updated }, 'Project updated'));
});

// ─── DELETE /projects/:id ─────────────────────────────────────────────────

export const deleteProject = asyncHandler(async (req: Request<IdParam>, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  // Clean up all Cloudinary assets
  const publicIds = [
    project.coverImage?.publicId,
    ...project.images.map((img) => img.publicId),
  ].filter(Boolean) as string[];

  if (publicIds.length) {
    await Promise.all(
      publicIds.map((id) => cloudinary.uploader.destroy(id))
    );
  }

  await project.deleteOne();

  res.status(200).json(
    new ApiResponse(200, { id: req.params.id }, 'Project deleted')
  );
});

// ─── PATCH /projects/:id/toggle-publish ──────────────────────────────────

export const togglePublish = asyncHandler(async (req: Request<IdParam>, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  project.published = !project.published;
  await project.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { project },
      `Project ${project.published ? 'published' : 'unpublished'}`
    )
  );
});

// ─── DELETE /projects/:id/images/:publicId ────────────────────────────────
// Remove a single gallery image

export const deleteProjectImage = asyncHandler(async (req: Request<IdPublicIdParam>, res: Response) => {
  const { id, publicId } = req.params;
  const decodedId = decodeURIComponent(publicId);

  const project = await Project.findById(id);
  if (!project) throw ApiError.notFound('Project not found');

  await cloudinary.uploader.destroy(decodedId);

  project.images = project.images.filter((img) => img.publicId !== decodedId);
  await project.save();

  res.status(200).json(
    new ApiResponse(200, { project }, 'Image removed')
  );
});