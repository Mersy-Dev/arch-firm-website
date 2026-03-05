import { Request, Response } from 'express';
import Service from '../models/Service.model';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service';

// ── Public: Get all active services ─────────────────────────────────────────
export const getAllServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await Service.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .select('-__v');

  res.status(200).json(new ApiResponse(200, services, 'Services fetched successfully'));
});

// ── Public: Get single service by slug ──────────────────────────────────────
export const getServiceBySlug = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findOne({ slug: req.params.slug, isActive: true }).select('-__v');
  if (!service) throw new ApiError(404, 'Service not found');
  res.status(200).json(new ApiResponse(200, service, 'Service fetched successfully'));
});

// ── Admin: Get all services (including inactive) ─────────────────────────────
export const getAdminServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await Service.find()
    .sort({ order: 1, createdAt: 1 })
    .select('-__v');
  res.status(200).json(new ApiResponse(200, services, 'All services fetched successfully'));
});

// ── Admin: Get single service by ID ─────────────────────────────────────────
export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id).select('-__v');
  if (!service) throw new ApiError(404, 'Service not found');
  res.status(200).json(new ApiResponse(200, service, 'Service fetched successfully'));
});

// ── Admin: Create service ────────────────────────────────────────────────────
export const createService = asyncHandler(async (req: Request, res: Response) => {
  const {
    number, title, tagline, shortDesc, description,
    features, deliverables, isActive, order,
  } = req.body;

  // Duplicate title check
  const existing = await Service.findOne({ title });
  if (existing) throw new ApiError(409, 'A service with this title already exists');

  // ── Image upload ──
  // multer memoryStorage puts the file in req.file.buffer (no .path)
  let image: string | undefined;

  if (req.file?.buffer) {
    image = await uploadToCloudinary(req.file.buffer, 'forma/services');
  } else if (req.body.image) {
    image = req.body.image;
  }

  if (!image) throw new ApiError(400, 'Service image is required');

  const service = await Service.create({
    number,
    title,
    tagline,
    shortDesc,
    description,
    features:     Array.isArray(features)      ? features      : JSON.parse(features     ?? '[]'),
    deliverables: Array.isArray(deliverables)   ? deliverables  : JSON.parse(deliverables ?? '[]'),
    image,
    isActive: isActive === 'false' ? false : Boolean(isActive ?? true),
    order:    Number(order ?? 0),
  });

  res.status(201).json(new ApiResponse(201, service, 'Service created successfully'));
});

// ── Admin: Update service ────────────────────────────────────────────────────
export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) throw new ApiError(404, 'Service not found');

  // Duplicate title check (skip if title hasn't changed)
  if (req.body.title && req.body.title !== service.title) {
    const dup = await Service.findOne({ title: req.body.title });
    if (dup) throw new ApiError(409, 'A service with this title already exists');
  }

  // ── Image upload ──
  // If a new file was uploaded, swap out the old Cloudinary image
  if (req.file?.buffer) {
    if (service.image?.includes('cloudinary.com')) {
      await deleteFromCloudinary(service.image).catch(() => {});
    }
    req.body.image = await uploadToCloudinary(req.file.buffer, 'forma/services');
  }

  // Parse arrays if sent as JSON strings (multipart/form-data)
  if (req.body.features && !Array.isArray(req.body.features))
    req.body.features = JSON.parse(req.body.features);
  if (req.body.deliverables && !Array.isArray(req.body.deliverables))
    req.body.deliverables = JSON.parse(req.body.deliverables);

  const updated = await Service.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).select('-__v');

  res.status(200).json(new ApiResponse(200, updated, 'Service updated successfully'));
});

// ── Admin: Toggle service active status ─────────────────────────────────────
export const toggleServiceStatus = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');

  service.isActive = !service.isActive;
  await service.save();

  res.status(200).json(
    new ApiResponse(200, service, `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`)
  );
});

// ── Admin: Reorder services ──────────────────────────────────────────────────
export const reorderServices = asyncHandler(async (req: Request, res: Response) => {
  const { order } = req.body as { order: { id: string; order: number }[] };

  if (!Array.isArray(order) || order.length === 0)
    throw new ApiError(400, 'Order array is required');

  await Service.bulkWrite(
    order.map(({ id, order: o }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: o } } },
    }))
  );

  res.status(200).json(new ApiResponse(200, null, 'Services reordered successfully'));
});

// ── Admin: Delete service ────────────────────────────────────────────────────
export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');

  if (service.image?.includes('cloudinary.com')) {
    await deleteFromCloudinary(service.image).catch(() => {});
  }

  res.status(200).json(new ApiResponse(200, null, 'Service deleted successfully'));
});