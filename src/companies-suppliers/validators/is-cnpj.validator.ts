import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

function onlyDigits(v: string) { return (v || '').replace(/\D/g, ''); }

function isValidCnpj(v: string): boolean {
  const c = onlyDigits(v);
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const calc = (len: number) => {
    let sum = 0, pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += parseInt(c[len - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const res = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return res === parseInt(c[len]);
  };
  return calc(12) && calc(13);
}

export function IsCnpj(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsCnpj',
      target: object.constructor,
      propertyName,
      options: { message: 'CNPJ inválido', ...validationOptions },
      validator: {
        validate(value: any) { return typeof value === 'string' && isValidCnpj(value); },
        defaultMessage(args?: ValidationArguments) { return `${args?.property} inválido`; },
      },
    });
  };
}
