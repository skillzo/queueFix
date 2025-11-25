import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export interface CompanyHours {
  weekdays: string;
  weekends: string;
}

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  address: string;

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ type: "jsonb", nullable: true })
  hours?: CompanyHours;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: "int", default: 1 })
  serviceTimeMinutes: number;

  @Column({ type: "int", nullable: true, default: 100 })
  maxQueueCapacity?: number;

  @Column({ type: "varchar", length: 10, default: "A", unique: true })
  queuePrefix: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
