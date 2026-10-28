import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid email/username or password.' },
      { status: 400 }
    );
  }

  const { identifier } = parsed.data;
  const isEmail = identifier.includes('@');
  const name = isEmail ? identifier.split('@')[0] : identifier;

  await new Promise((resolve) => setTimeout(resolve, 650));

  return NextResponse.json({
    success: true,
    message: 'Signed in successfully.',
    data: {
      user: {
        name: name
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (character) => character.toUpperCase()),
        identifier,
      },
    },
  });
}
