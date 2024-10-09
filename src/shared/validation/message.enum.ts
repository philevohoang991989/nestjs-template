export enum ValidationMessage {
  DEFAULT = ':property is not valid',
  NOT_EMPTY = ':property is required',
  EMAIL_INVALID = ':property is not an valid email',
  PASSWORD_NOT_STRONG = ':property is not an strong password',
  MIN_INVALID = ':property must not less than :min',
  MAX_INVALID = ':property must not greater than :max',
  LENGTH_INVALID = ':property length should be between :min and :max',
}
