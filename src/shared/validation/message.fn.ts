import { ValidationArguments } from 'class-validator';
import { ValidationMessage } from './message.enum';

export const ValidationMessageFn = {
  default: () =>
    JSON.stringify({
      template: ValidationMessage.DEFAULT,
    }),
  notEmpty: () =>
    JSON.stringify({
      template: ValidationMessage.NOT_EMPTY,
    }),
  email: () =>
    JSON.stringify({
      template: ValidationMessage.EMAIL_INVALID,
    }),
  passwordStrong: () =>
    JSON.stringify({
      template: ValidationMessage.PASSWORD_NOT_STRONG,
    }),
  min: (args: ValidationArguments) =>
    JSON.stringify({
      template: ValidationMessage.MIN_INVALID,
      min: args.constraints[0],
    }),
  max: (args: ValidationArguments) =>
    JSON.stringify({
      template: ValidationMessage.MAX_INVALID,
      max: args.constraints[0],
    }),
  length: (args: ValidationArguments) =>
    JSON.stringify({
      template: ValidationMessage.LENGTH_INVALID,
      min: args.constraints[0],
      max: args.constraints[1],
    }),
};
