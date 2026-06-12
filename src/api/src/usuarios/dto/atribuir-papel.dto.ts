import { IsEnum } from 'class-validator';
import { Papel } from '../../common/enums/papel.enum';

export class AtribuirPapelDto {
  @IsEnum(Papel)
  papel!: Papel;
}
