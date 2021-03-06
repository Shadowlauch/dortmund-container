import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {EmptyHistory} from './EmptyHistory';

@Entity()
export class Container {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    lat: number;

    @Column()
    lon: number;

    @Column()
    internalId: number;

    @Column()
    street: string;

    @OneToMany(() => EmptyHistory, history => history.container)
    emptyHistory: EmptyHistory[];

}
