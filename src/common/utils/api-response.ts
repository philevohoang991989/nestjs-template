import { ERROR_CODE } from '../constants/error-code.enum';

export function successResponse(data: any, message = 'Success') {
  return {
    data,
    msgSts: {
      code: ERROR_CODE.SUCCESS,
      message,
    },
  };
}

export function errorResponse(message = 'Error', code = ERROR_CODE.FAIL) {
  return {
    data: null,
    msgSts: {
      code,
      message,
    },
  };
}
