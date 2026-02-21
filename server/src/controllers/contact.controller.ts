import Contact from '../models/Contact.model';
import { EmailService } from '../services/email.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { getPaginationParams, buildPaginatedResult } from '../utils/pagination';

// POST /api/v1/contact — Public
export const submitContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create({
    ...req.body,
    ipAddress: req.ip,
  });

  // Fire emails — don't fail the request if email fails
  Promise.allSettled([
    EmailService.sendAdminNotification(req.body),
    EmailService.sendAutoReply(req.body.name, req.body.email),
  ]);

  res.status(201).json(new ApiResponse(201, contact, 'Enquiry submitted successfully'));
});

// GET /api/v1/contact — Admin only
export const getEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);
  const filter = req.query.unread === 'true' ? { isRead: false } : {};

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Contact.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, buildPaginatedResult(contacts, total, page, limit), 'Enquiries fetched')
  );
});

// PATCH /api/v1/contact/:id/read — Admin only
export const markAsRead = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  if (!contact) throw ApiError.notFound('Enquiry');
  res.status(200).json(new ApiResponse(200, contact, 'Marked as read'));
});