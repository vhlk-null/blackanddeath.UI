import { computed, Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

    private _count = signal(0);
    readonly isLoading = computed(() => this._count() > 0);

    show(): void {
        this._count.update(n => n + 1);
    }

    hide(): void {
        this._count.update(n => Math.max(0, n - 1));
    }

    reset(): void {
        this._count.set(0);
    }

}