import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum QueueEntryStatus {
  WAITING = "waiting",
  SERVING = "serving",
  COMPLETED = "completed",
  LEFT = "left",
}

@Entity("queue_entries")
export class QueueEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  companyId: string;

  @Column({ type: "uuid", nullable: true })
  userId?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column()
  fullName: string;

  @Column()
  queueNumber: string; // Format: A-123

  @Column({ type: "int" })
  position: number;

  @Column({
    type: "enum",
    enum: QueueEntryStatus,
    default: QueueEntryStatus.WAITING,
  })
  status: QueueEntryStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  leftAt?: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
