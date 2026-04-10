import { ChangeDetectorRef, Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTableScroll]',
 })
export class TableScrollDirective {
 
  constructor(private el: ElementRef, private renderer: Renderer2, private cdr: ChangeDetectorRef) { }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    // Get the scroll position of the container
    const scrollTop = this.el.nativeElement.scrollTop;
    
    // Get the table element
    const table = this.el.nativeElement.querySelector('table');
    if (table) {
      const thead = table.querySelector('thead');
      const filterRow = table.querySelector('.filter_tr') as HTMLElement;
    
      if (scrollTop > 80) {
        this.renderer.addClass(table, 'tableScrolled');
    
        if (thead && filterRow) {
          const theadHeight = thead.offsetHeight - 5;
          filterRow.style.top = `${theadHeight}px`;
        }
      } else {
        this.renderer.removeClass(table, 'tableScrolled');
    
        // Reset the filterRow top position
        if (filterRow) {
          filterRow.style.top = '0px'; // Or '' to clear the inline style
        }
      }
    }

    // Ensure change detection is triggered for updates
    this.cdr.detectChanges();
  }
}
