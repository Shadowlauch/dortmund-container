import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne} from 'typeorm';
import {Container} from './Container';

@Entity()
export class EmptyHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date;

    @ManyToOne(() => Container, container => container.emptyHistory)
    container: Container;
}
