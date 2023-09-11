import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntArrayPipe implements PipeTransform<string[], number[]> {
  transform(value: string[]): number[] {
    const numberArray = value.map((item) => parseInt(item, 10));

    if (numberArray.some(isNaN)) {
      throw new BadRequestException('Invalid number format in the array');
    }

    return numberArray;
  }
}
