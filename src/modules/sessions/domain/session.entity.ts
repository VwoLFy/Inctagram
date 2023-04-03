import { SessionExtendedDto } from '../application/dto/SessionExtendedDto';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/domain/user.entity';

@Entity('Sessions')
export class Session {
  @PrimaryGeneratedColumn('increment')
  deviceId: number;
  @Column()
  userId: number;
  @Column()
  exp: number;
  @Column()
  ip: string;
  @Column()
  deviceName: string;
  @Column()
  iat: number;
  @ManyToOne(() => User)
  user: User;

  constructor({ ...dto }: SessionExtendedDto) {
    this.userId = dto.userId;
    this.exp = dto.exp;
    this.ip = dto.ip;
    this.deviceName = dto.deviceName;
    this.iat = dto.iat;
  }

  updateSessionData(dto: SessionExtendedDto) {
    this.ip = dto.ip;
    this.deviceName = dto.deviceName;
    this.exp = dto.exp;
    this.iat = dto.iat;
  }
}