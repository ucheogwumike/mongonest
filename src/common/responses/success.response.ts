import { HttpStatus } from '@nestjs/common';

export function SuccessResponse(
  message: string,
  data: any = {},
  code: HttpStatus = HttpStatus.OK,
) {
  return { data, message, error: false, code };
}
