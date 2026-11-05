import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { HttpHistory } from '../../core/services/http-history';

interface ClientHistorySummary {
    clientId: string;
    username: string;
    serviceCount: number;
    orderCount: number;
    totalSpent: number;
}

@Component({
    selector: 'app-history',
    imports: [CurrencyPipe, AsyncPipe, RouterLink],
    templateUrl: './history.html',
    styleUrl: './history.css',
})
export default class History implements OnInit {
    private httpHistory = inject(HttpHistory);

    private clients$ = new BehaviorSubject<ClientHistorySummary[]>([]);
    private searchTerm$ = new BehaviorSubject<string>('');

    filteredClients$ = combineLatest([this.clients$, this.searchTerm$]).pipe(
        map(([clients, term]) => {
            const t = term.toLowerCase().trim();
            if (!t) return clients;
            return clients.filter((c) => c.username?.toLowerCase().includes(t));
        }),
    );

    getInitials(username: string): string {
        if (!username) return '?';
        const parts = username.trim().split(/\s+/);
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    ngOnInit(): void {
        this.loadHistories();
    }

    onSearchChange(term: string): void {
        this.searchTerm$.next(term);
    }

    private loadHistories(): void {
        this.httpHistory.getHistories().subscribe({
            next: (res: any) => {
                const histories: any[] = res?.data ?? [];

                const clients = histories
                    
                    .filter((h) => h.user?._id)
                    .map((h): ClientHistorySummary => ({
                        clientId: h.user._id,
                        username: h.user.username,
                        serviceCount: h.services?.length ?? 0,
                        orderCount: h.products?.length ?? 0,
                        totalSpent:
                            (h.services ?? []).reduce((sum: number, s: any) => sum + (s.finalCost || 0), 0) +
                            (h.products ?? []).reduce((sum: number, p: any) => sum + (p.total || 0), 0),
                    }))
                    .sort((a, b) => a.username?.localeCompare(b.username));

                this.clients$.next(clients);
            },
            error: (error) => console.error(error),
        });
    }
}