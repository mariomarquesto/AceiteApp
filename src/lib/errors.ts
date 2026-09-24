import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  console.error('[API Error]', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Datos invalidos', details: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: 'Error interno' }, { status: 500 });
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
