export class Prize {
    id: number;
    name: string;
    cost: number;
    category: number;
    already_won: boolean;
    won_date: Date;
    time_end: Date;
    time_end_24h: Date;
    countdown_time: number;
    user: string;
    picture: string;
    timer: any;
    isDeleting: boolean;
}