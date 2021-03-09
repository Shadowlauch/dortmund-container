import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {EmptyHistory} from './EmptyHistory';

@Entity()
export class Container {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column({
        type: "float"
    })
    lat: number;

    @Column({
        type: "float"
    })
    lon: number;

    @Column()
    internalId: string;

    @Column()
    street: string;

    @OneToMany(() => EmptyHistory, history => history.container)
    emptyHistory: EmptyHistory[];

}
