import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await Settings.findOne();
  if (!settings) {
    const created = await Settings.create({});
    return sendSuccess(res, created, 'Settings');
  }
  return sendSuccess(res, settings, 'Settings');
});

export const updateSettings = asyncHandler(
  async (req: Request, res: Response) => {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    Object.assign(settings, req.body);
    await settings.save();
    return sendSuccess(res, settings, 'Settings updated');
  }
);
