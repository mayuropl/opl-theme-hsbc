import { Signal, WritableSignal, computed, signal } from "@angular/core";

export class PaginationSignal {
  pageSize: WritableSignal<number> = signal(10);
  startIndex: Signal<number> = computed(() => this.getExpStartIndex()) ;
  endIndex:  Signal<number> = computed(() => this.getExpEndIndex()) ;
  totalSize: number = 0;
  page: WritableSignal<number> = signal(1);

  getExpStartIndex(): number {
    return (this.page() - 1) * this.pageSize() ;
  }

  getExpEndIndex(): number {
    return this.getExpStartIndex() + this.pageSize() - 1;
  }

}


